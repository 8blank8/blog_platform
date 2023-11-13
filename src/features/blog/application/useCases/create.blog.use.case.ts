import { CommandHandler } from "@nestjs/cqrs"
import { BlogCreateType } from "../../models/blog.create.type"
import { Blogs } from "../../domain/typeorm/blog.entity"
import { BlogRepositoryTypeorm } from "../../infrastructure/typeorm/blog.repository.typeorm"

export class CreateBlogCommand {
    constructor(
        public blog: BlogCreateType,
    ) { }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
    constructor(
        private blogRepository: BlogRepositoryTypeorm,
    ) { }

    async execute(command: CreateBlogCommand): Promise<string> {

        const { blog } = command

        const createdBlog = new Blogs()
        createdBlog.name = blog.name
        createdBlog.description = blog.description
        createdBlog.websiteUrl = blog.websiteUrl

        await this.blogRepository.saveBlog(createdBlog)
        return createdBlog.id
    }
}