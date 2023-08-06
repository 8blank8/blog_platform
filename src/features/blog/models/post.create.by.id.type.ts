import { IsString, Length, IsNotEmpty } from "class-validator"

export class PostCreateByIdType {
    @IsNotEmpty()
    @IsString()
    @Length(0, 30)
    title: string

    @IsNotEmpty()
    @IsString()
    @Length(0, 100)
    shortDescription: string

    @IsNotEmpty()
    @IsString()
    @Length(0, 1000)
    content: string
}