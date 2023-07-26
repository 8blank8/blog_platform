import { Length } from "class-validator"

export class BlogCreateType {
    @Length(5)
    name: string
    description: string
    websiteUrl: string
}