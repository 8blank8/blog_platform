import { IsNotEmpty, IsString } from "class-validator";


export class ConfirmationCodeType {
    @IsNotEmpty()
    @IsString()
    code: string
}