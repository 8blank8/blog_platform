import { Injectable } from "@nestjs/common";
import { TelegramResponseModel } from "../models/telegram.response.model";
import { CreateTelegramProfileUseCase } from "./create.telegram.profile.use.case";
import { TelegramAdapter } from "@utils/adapters/telegram.adapter";

@Injectable()
export class HandlerTelegramUseCase {

    constructor(
        private createTelegramProfileUseCase: CreateTelegramProfileUseCase,
        private telegramAdapter: TelegramAdapter
    ) { }

    async execute(inputData: TelegramResponseModel): Promise<boolean> {
        let authCode: string | null = null
        if (inputData.message) {
            const [other, code] = inputData.message.text.split('=')
            authCode = code
        }
        // console.log(inputData)
        if (authCode) {
            await this.createTelegramProfileUseCase.execute(authCode, inputData)
        }
        // else {
        //     await this.telegramAdapter.sendMessage(String(inputData.message.from.id), 'Сори не знаю что это')
        // }

        return true
    }
}