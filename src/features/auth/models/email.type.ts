import { IsNotEmpty, IsString, IsEmail, Validate } from "class-validator"
import { EmailCodeResend } from "src/entity/custom-validation/email.code.resend"

export class EmailType {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @Validate(EmailCodeResend)
    email: string
}