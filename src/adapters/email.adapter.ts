import nodemailer from 'nodemailer'
import { Injectable } from '@nestjs/common'
import { setting_env } from 'setting.env'

@Injectable()
export class EmailAdapter {

    async sendEmail(email: string, subject: string, message: string) {

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: setting_env.EMAIL,
                pass: setting_env.EMAIL_PASSWORD
            }
        })

        const info = await transport.sendMail({
            from: 'Vladimir <masvladimir38@gmail.com>',
            to: email,
            subject: subject,
            html: message
        })

        return info
    }
}