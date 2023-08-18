import { CommandHandler } from "@nestjs/cqrs";
import { BlogRepository } from "../../infrastructure/blog.repository";
import { BlogQueryRepository } from "../../infrastructure/blog.query.repository";

export class DeleteBlogCommand {
    constructor(public id: string) { }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase {
    constructor(
        private blogRepository: BlogRepository,
        private blogQueryRepository: BlogQueryRepository
    ) { }

    async execute(command: DeleteBlogCommand): Promise<boolean> {
        const blog = await this.blogQueryRepository.findBlogDocumentById(command.id)
        if (!blog) return false

        const isDelete = await this.blogRepository.deleteBlog(blog.id)
        if (!isDelete) return false

        return true
    }
}