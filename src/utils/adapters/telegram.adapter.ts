import { Injectable } from "@nestjs/common";
import axios from 'axios';
import { AxiosInstance } from "axios";


@Injectable()
export class TelegramAdapter {
    axiosInstance: AxiosInstance;
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: `https://api.telegram.org/bot${String(process.env.TELEGRAM_KEY)}/`
        })
    }

    async setWebhook(baseUrl: string) {
        await this.axiosInstance.post('setWebhook', {
            url: `${baseUrl}/integrations/telegram/webhook`
        })
    }

    async sendMessage(telegramId: string, text: string) {
        await this.axiosInstance.post('sendMessage', {
            chat_id: telegramId,
            text: text
        })
    }

}