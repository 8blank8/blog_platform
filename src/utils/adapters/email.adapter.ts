import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailAdapter {
  async sendEmail(email: string, subject: string, message: string) {
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'springfield.3298@gmail.com',
        pass: 'tebbhlqboaafrple',
      },
    });

    const info = await transport.sendMail({
      from: 'Vladimir <masvladimir38@gmail.com>',
      to: email,
      subject: subject,
      html: message,
    });

    return info;
  }
}
