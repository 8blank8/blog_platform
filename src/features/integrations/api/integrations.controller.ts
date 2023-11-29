import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { TelegramResponseModel } from "../models/telegram.response.model";
import { HandlerTelegramUseCase } from "../useCases/handler.telegram.use.case";
import { CreateTelegramAuthCodeUseCase } from "../useCases/create.telegram.auth.code";
import { JwtAuthGuard } from "@auth/guards/jwt.guard";
import { Response } from "express";


@Controller('integrations/telegram')
export class IntegrationsController {
    constructor(
        private handlerTelegramUseCase: HandlerTelegramUseCase,
        private createTelegramAuthCodeUseCase: CreateTelegramAuthCodeUseCase
    ) { }

    @Post('webhook')
    async telegramWebhook(
        @Body() inputData: TelegramResponseModel,
        @Res() res: Response
    ) {
        await this.handlerTelegramUseCase.execute(inputData)
        return res.sendStatus(HttpStatus.NO_CONTENT)
    }

    @UseGuards(JwtAuthGuard)
    @Get('auth-bot-link')
    async getAuthLinkForTelegramBot(
        @Req() req
    ) {
        const userId = req.user
        const link = await this.createTelegramAuthCodeUseCase.execute(userId)
        return link
    }
}