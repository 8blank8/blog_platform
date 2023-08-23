import { IsBoolean, IsNotEmpty, IsString, MinLength } from "class-validator"


export class BanUserForBlogModel {
    @IsNotEmpty()
    @IsBoolean()
    isBanned: boolean

    @IsNotEmpty()
    @IsString()
    @MinLength(20)
    banReason: string
}