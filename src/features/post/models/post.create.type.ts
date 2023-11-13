import { IsString, Length, IsNotEmpty, Validate } from "class-validator"
import { CheckBlogId } from "../../../utils/custom-validation/check.blogId"
import { IsNotBlank } from "../../../utils/custom-validation/is.not.blank"

export class PostCreateType {
    @IsNotEmpty()
    @IsString()
    @Validate(IsNotBlank)
    @Length(0, 30)
    title: string

    @IsNotEmpty()
    @IsString()
    @Validate(IsNotBlank)
    @Length(0, 100)
    shortDescription: string

    @IsNotEmpty()
    @IsString()
    @Validate(IsNotBlank)
    @Length(0, 1000)
    content: string

    @IsNotEmpty()
    @IsString()
    @Validate(CheckBlogId)
    blogId: string
}
