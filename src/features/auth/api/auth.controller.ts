import { Controller, Get, Post, UseGuards, Request, Res, Body } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "../application/auth.service";
import { LocalAuthGuard } from "../guards/local.guard";
import { JwtAuthGuard } from "../guards/jwt.guard";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { UserCreateType } from "src/features/user/models/user.create.type";
import { UserService } from "src/features/user/application/user.service";
import { ConfirmationCodeType } from "../models/confirmation.code.type";
import { EmailType } from "../models/email.type";
import { SecurityService } from "../../security/application/security.service";
import { JwtRefreshTokenGuard } from "../guards/jwt.refresh.token.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { STATUS_CODE } from "src/entity/enum/status.code";

@Controller('/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userQueryRepository: UserQueryRepository,
        private readonly userService: UserService,
        private readonly securityService: SecurityService
    ) { }

    @UseGuards(ThrottlerGuard, LocalAuthGuard)
    @Post('/login')
    async login(
        @Request() req,
        @Res() res: Response
    ) {
        const device = await this.securityService.createDevice(req.user.id, req.ip, req.headers['user-agent'])

        const token = await this.authService.login(req.user)
        const refreshToken = await this.authService.createRefreshToken(req.user.id, device.deviceId)

        res
            .status(STATUS_CODE.OK)
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
            .send(token)
    }

    @Get('/me')
    @UseGuards(JwtAuthGuard)
    async getMe(@Request() req) {
        return await this.userQueryRepository.findUserById(req.user.id)
    }

    @Post('/registration')
    async registrationUser(
        @Body() inputData: UserCreateType,
        @Res() res: Response
    ) {
        const isCreated = await this.userService.registrationUser(inputData)
        if (!isCreated) return res.sendStatus(STATUS_CODE.BAD_REQUEST)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @Post('/registration-confirmation')
    async registrationConfirmation(
        @Body() code: ConfirmationCodeType,
        @Res() res: Response
    ) {
        const isConfirmed = await this.userService.confirmationEmail(code)
        if (!isConfirmed) return res.sendStatus(STATUS_CODE.BAD_REQUEST)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @Post('/registration-email-resending')
    async registrationEmailResending(
        @Body() email: EmailType,
        @Res() res: Response
    ) {
        const isResending = await this.userService.confirmationCodeResending(email)
        if (!isResending) return res.sendStatus(STATUS_CODE.BAD_REQUEST)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Post('refresh-token')
    async updateRefreshRoken(
        @Request() req,
        @Res() res: Response
    ) {
        const token = await this.authService.login(req.user)
        const refreshToken = await this.authService.createRefreshToken(req.user.userId, req.user.deviceId)

        res
            .status(STATUS_CODE.OK)
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
            .send(token)
    }
}