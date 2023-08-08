import { IsNotEmpty, IsString, Length, Validate } from "class-validator"
import { CheckBlogId } from "../../../entity/custom-validation/check.blogId"
import { IsNotBlank } from "../../../entity/custom-validation/is.not.blank"

export class PostUpdateType {
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
