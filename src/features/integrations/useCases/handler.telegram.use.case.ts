import { Injectable } from "@nestjs/common";
import { TelegramResponseModel } from "../models/telegram.response.model";
import { CreateTelegramProfileUseCase } from "./create.telegram.profile.use.case";

@Injectable()
export class HandlerTelegramUseCase {

    constructor(
        private createTelegramProfileUseCase: CreateTelegramProfileUseCase
    ) { }

    async execute(inputData: TelegramResponseModel): Promise<boolean> {

        const [other, code] = inputData.message.text.split('=')

        if (code) {
            await this.createTelegramProfileUseCase.execute(code, inputData)
        }

        return true
    }
}