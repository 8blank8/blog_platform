import { IsString, Length, IsNotEmpty } from "class-validator"

export class PostCreateType {
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

    @IsNotEmpty()
    @IsString()
    blogId: string
}
