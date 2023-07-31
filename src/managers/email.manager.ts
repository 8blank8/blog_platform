import { EmailAdapter } from "src/adapters/email.adapter";
import { Injectable } from '@nestjs/common'

@Injectable()
export class EmailManager {
    constructor(private readonly emailAdapter: EmailAdapter) { }

    async sendPasswordRecovery(email: string, code: string) {
        await this.emailAdapter.sendEmail(
            email,
            "Password recovery",
            `<h1>Password recovery</h1><p>To finish password recovery please follow the link below: <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a></p>`)
    }

    async sendEmailConfirmationMessage(email: string, code: string) {
        await this.emailAdapter.sendEmail(
            email,
            "Confirmation code",
            `<a href='https://some-front.com/confirm-registration?code=${code}'>https://some-front.com/confirm-registration?code=${code}</a>`)
    }
}