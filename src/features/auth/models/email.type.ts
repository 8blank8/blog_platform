import { EmailCodeResend } from '@src/utils/custom-validation/email.code.resend';
import { IsNotEmpty, IsString, IsEmail, Validate } from 'class-validator';

export class EmailType {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Validate(EmailCodeResend)
  email: string;
}
