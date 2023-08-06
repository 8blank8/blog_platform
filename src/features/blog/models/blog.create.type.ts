import { Transform } from "class-transformer"
import { Length, IsString, IsNotEmpty, Matches, NotContains } from "class-validator"

export class BlogCreateType {
    @IsNotEmpty()
    @IsString()
    @Length(0, 15)
    @NotContains(" ")
    @Transform(({ value }) => value?.trim())
    name: string

    @IsNotEmpty()
    @IsString()
    @Length(0, 500)
    @NotContains(" ")
    @Transform(({ value }) => value?.trim())
    description: string

    @IsNotEmpty()
    @IsString()
    @Length(0, 100)
    @Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/)
    websiteUrl: string
}