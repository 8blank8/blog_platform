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


@Controller('/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly userQueryRepository: UserQueryRepository,
        private readonly userService: UserService
    ) { }

    @UseGuards(LocalAuthGuard)
    @Post('/login')
    async login(
        @Request() req,
        @Res() res: Response
    ) {
        const token = await this.authService.login(req.user)
        const refreshToken = await this.authService.createRefreshToken(req.user)

        res
            .status(200)
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
            .send(token)
    }

    @Get('/me')
    @UseGuards(JwtAuthGuard)
    async getMe(@Request() req) {
        console.log(req.user)
        return await this.userQueryRepository.findUserById(req.user.id)
    }

    @Post('/registration')
    async registrationUser(
        @Body() inputData: UserCreateType,
        @Res() res: Response
    ) {
        const isCreated = await this.userService.registrationUser(inputData)
        if (!isCreated) return res.sendStatus(400)

        return res.sendStatus(204)
    }

    @Post('/registration-confirmation')
    async registrationConfirmation(
        @Body() code: ConfirmationCodeType,
        @Res() res: Response
    ) {
        const isConfirmed = await this.userService.confirmationEmail(code)
        if (!isConfirmed) return res.sendStatus(400)

        return res.sendStatus(204)
    }

    @Post('/registration-email-resending')
    async registrationEmailResending(
        @Body() email: EmailType,
        @Res() res: Response
    ) {
        const isResending = await this.userService.confirmationCodeResending(email)
        if (!isResending) return res.sendStatus(400)

        return res.sendStatus(204)
    }
}