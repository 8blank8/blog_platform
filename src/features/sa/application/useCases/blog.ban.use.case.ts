import { CommandHandler } from "@nestjs/cqrs";
import { BlogBanInputDataModel } from "../../api/models/blog.ban.input.data.model";

import { BlogQueryRepository } from "src/features/blog/infrastructure/blog.query.repository";
import { BlogRepository } from "src/features/blog/infrastructure/blog.repository";


export class BlogBanCommand {
    constructor(
        public blogId: string,
        public inputData: BlogBanInputDataModel
    ) { }
}

@CommandHandler(BlogBanCommand)
export class BlogBanUseCase {
    constructor(
        private blogQueryRepository: BlogQueryRepository,
        private blogRepository: BlogRepository
    ) { }

    async execute(command: BlogBanCommand) {
        const { inputData, blogId } = command

        const blog = await this.blogQueryRepository.findBlogDocumentById(blogId)
        if (!blog) return false

        blog.bannedBlog(inputData.isBanned)

        await this.blogRepository.save(blog)

        return true
    }
}