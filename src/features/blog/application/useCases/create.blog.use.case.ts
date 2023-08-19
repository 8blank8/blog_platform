import { CommandHandler } from "@nestjs/cqrs"
import { BlogRepository } from "../../infrastructure/blog.repository"
import { BlogCreateType } from "../../models/blog.create.type"
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository"

export class CreateBlogCommand {
    constructor(
        public blog: BlogCreateType,
        public userId: string
    ) { }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
    constructor(
        private blogRepository: BlogRepository,
        private userQueryRepository: UserQueryRepository
    ) { }

    async execute(command: CreateBlogCommand): Promise<string> {

        const { blog, userId } = command

        const newBlog = await this.blogRepository.createBlog(blog)
        newBlog.addId()
        newBlog.addCreatedAt()
        newBlog.setUserId(userId)

        await this.blogRepository.save(newBlog)
        return newBlog.id
    }
}