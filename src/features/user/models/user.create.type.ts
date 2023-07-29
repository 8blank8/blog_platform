import { IsNotEmpty, IsString, Length, Matches } from "class-validator"


export class UserCreateType {
    @IsNotEmpty()
    @IsString()
    @Length(3, 10)
    @Matches(/^[a-zA-Z0-9_-]*$/)
    login: string

    @IsNotEmpty()
    @IsString()
    @Length(6, 20)
    password: string

    @IsNotEmpty()
    @IsString()
    @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    email: string
}