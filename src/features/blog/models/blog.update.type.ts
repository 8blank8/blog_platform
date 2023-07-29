import { IsNotEmpty, IsString, Length, Matches } from "class-validator"

export class BlogUpdateType {
    @IsNotEmpty()
    @IsString()
    @Length(0, 15)
    name: string

    @IsNotEmpty()
    @IsString()
    @Length(0, 500)
    description: string

    @IsNotEmpty()
    @IsString()
    @Length(0, 100)
    @Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    websiteUrl: string
}