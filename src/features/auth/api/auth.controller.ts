import { Controller, Get, Post, UseGuards, Request, Res, Body } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "../application/auth.service";
import { LocalAuthGuard } from "../guards/local.guard";
import { JwtAuthGuard } from "../guards/jwt.guard";
import { UserQueryRepository } from "../../user/infrastructure/user.query.repository";
import { UserCreateType } from "../../user/models/user.create.type";
import { UserService } from "../../user/application/user.service";
import { ConfirmationCodeType } from "../models/confirmation.code.type";
import { EmailType } from "../models/email.type";
import { SecurityService } from "../../security/application/security.service";
import { JwtRefreshTokenGuard } from "../guards/jwt.refresh.token.guard";
import { ThrottlerGuard } from "@nestjs/throttler";
import { STATUS_CODE } from "../../../entity/enum/status.code";
import { CommandBus } from "@nestjs/cqrs";
import { CreateDeviceCommand } from "../../security/application/useCases/create.device.use.case";
import { RegistrationUserCommand } from "../../user/application/useCases/registration.user.use.case";
import { EmailConfirmationCommand } from "../../user/application/useCases/email.confirmation.use.case";
import { ResendingConfirmationCodeCommand } from "../../user/application/useCases/resending.confirmation.code.use.case";
import { LoginUserCommand } from "../application/useCases/login.user.use.case";
import { CreateRefreshTokenCommand } from "../application/useCases/create.refresh.token.use.case";
import { AddRefreshTokenInBlackListCommand } from "../application/useCases/add.refresh.token.in.black.list.use.case";
import { UserQueryRepositorySql } from "../../../features/user/infrastructure/user.query.repository.sql";

@Controller('/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        // private readonly userQueryRepository: UserQueryRepository,
        private userQueryRepositorySql: UserQueryRepositorySql,
        private readonly userService: UserService,
        private readonly securityService: SecurityService,
        private commandBus: CommandBus
    ) { }

    @UseGuards(ThrottlerGuard, LocalAuthGuard)
    @Post('/login')
    async login(
        @Request() req,
        @Res() res: Response
    ) {
        const deviceId = await this.commandBus.execute(new CreateDeviceCommand(req.user.id, req.ip, req.headers['user-agent']))

        const token = await this.commandBus.execute(new LoginUserCommand(req.user.id))
        const refreshToken = await this.commandBus.execute(new CreateRefreshTokenCommand(req.user.id, deviceId))
        console.log(new Date('2023-08-29 23:07:47.762294').toISOString())
        res
            .status(STATUS_CODE.OK)
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
            .send(token)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/me')
    async getMe(
        @Request() req,
    ) {
        const user = await this.userQueryRepositorySql.findMe(req.user)
        return user
    }

    @UseGuards(ThrottlerGuard)
    @Post('/registration')
    async registrationUser(
        @Body() inputData: UserCreateType,
        @Res() res: Response
    ) {
        const isCreated = await this.commandBus.execute(new RegistrationUserCommand(inputData))
        if (!isCreated) return res.sendStatus(STATUS_CODE.BAD_REQUEST)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(ThrottlerGuard)
    @Post('/registration-confirmation')
    async registrationConfirmation(
        @Body() code: ConfirmationCodeType,
        @Res() res: Response
    ) {
        const isConfirmed = await this.commandBus.execute(new EmailConfirmationCommand(code))
        if (!isConfirmed) return res.sendStatus(STATUS_CODE.BAD_REQUEST)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(ThrottlerGuard)
    @Post('/registration-email-resending')
    async registrationEmailResending(
        @Body() email: EmailType,
        @Res() res: Response
    ) {
        const isResending = await this.commandBus.execute(new ResendingConfirmationCodeCommand(email))
        if (!isResending) return res.sendStatus(STATUS_CODE.BAD_REQUEST)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Post('refresh-token')
    async updateRefreshRoken(
        @Request() req,
        @Res() res: Response
    ) {
        await this.commandBus.execute(new AddRefreshTokenInBlackListCommand(req.cookies.refreshToken))

        const token = await this.commandBus.execute(new LoginUserCommand(req.user.userId))
        const refreshToken = await this.commandBus.execute(new CreateRefreshTokenCommand(req.user.userId, req.user.deviceId))

        if (!refreshToken) res.sendStatus(401)

        res
            .status(STATUS_CODE.OK)
            .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
            .send(token)
    }

    @Post('/logout')
    @UseGuards(JwtRefreshTokenGuard)
    async logoutUser(
        @Request() req,
        @Res() res: Response
    ) {
        await this.commandBus.execute(new AddRefreshTokenInBlackListCommand(req.cookies.refreshToken, req.user.deviceId))
        return res.sendStatus(204)
    }
}