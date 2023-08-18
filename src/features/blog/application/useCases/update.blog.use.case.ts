import { CommandHandler } from "@nestjs/cqrs";
import { BlogUpdateType } from "../../models/blog.update.type";
import { BlogRepository } from "../../infrastructure/blog.repository";
import { BlogQueryRepository } from "../../infrastructure/blog.query.repository";

export class UpdateBlogCommand {
    constructor(
        public updateData: BlogUpdateType,
        public id: string
    ) { }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase {

    constructor(
        private blogRepository: BlogRepository,
        private blogQueryRepository: BlogQueryRepository
    ) { }

    async execute(command: UpdateBlogCommand) {
        const blog = await this.blogQueryRepository.findBlogDocumentById(command.id)
        if (!blog) return false

        blog.updateBlog(command.updateData)

        return this.blogRepository.save(blog)
    }
}