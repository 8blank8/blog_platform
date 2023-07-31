import { IsNotEmpty, IsString, IsEmail } from "class-validator"

export class EmailType {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string
}