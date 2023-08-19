import { CommandHandler } from "@nestjs/cqrs";
import { BlogQueryRepository } from "src/features/blog/infrastructure/blog.query.repository";
import { BlogRepository } from "src/features/blog/infrastructure/blog.repository";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";


export class BindUserForBlogCommand {
    constructor(
        public userId: string,
        public blogId: string
    ) { }
}

@CommandHandler(BindUserForBlogCommand)
export class BindUserForBlogUseCase {
    constructor(
        private blogQueryRepository: BlogQueryRepository,
        private userQueryRepository: UserQueryRepository,
        private blogRepository: BlogRepository
    ) { }

    async execute(command: BindUserForBlogCommand): Promise<boolean> {
        const { userId, blogId } = command

        const user = await this.userQueryRepository.findUserDocumentById(userId)
        const blog = await this.blogQueryRepository.findBlogDocumentById(blogId)
        if (!blog || !user) return false

        blog.setUserId(userId)
        await this.blogRepository.save(blog)

        return true
    }
}