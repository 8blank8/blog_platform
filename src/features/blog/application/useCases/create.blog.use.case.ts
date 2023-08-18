import { CommandHandler } from "@nestjs/cqrs"
import { BlogRepository } from "../../infrastructure/blog.repository"
import { BlogCreateType } from "../../models/blog.create.type"

export class CreateBlogCommand {
    constructor(public blog: BlogCreateType) { }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
    constructor(
        private readonly blogRepository: BlogRepository,
    ) { }

    async execute(command: CreateBlogCommand): Promise<string> {
        const newBlog = await this.blogRepository.createBlog(command.blog)
        newBlog.addId()
        newBlog.addCreatedAt()

        await this.blogRepository.save(newBlog)
        return newBlog.id
    }
}