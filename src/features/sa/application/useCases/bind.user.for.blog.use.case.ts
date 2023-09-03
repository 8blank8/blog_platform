import { CommandHandler } from "@nestjs/cqrs";
import { BlogQueryRepository } from "src/features/blog/infrastructure/mongo/blog.query.repository";
import { BlogRepository } from "src/features/blog/infrastructure/mongo/blog.repository";
import { BlogQueryRepositorySql } from "src/features/blog/infrastructure/sql/blog.query.repository.sql";
import { BlogRepositorySql } from "src/features/blog/infrastructure/sql/blog.repository.sql";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { UserQueryRepositorySql } from "src/features/user/infrastructure/user.query.repository.sql";


export class BindUserForBlogCommand {
    constructor(
        public userId: string,
        public blogId: string
    ) { }
}

@CommandHandler(BindUserForBlogCommand)
export class BindUserForBlogUseCase {
    constructor(
        // private blogQueryRepository: BlogQueryRepository,
        private blogQueryRepositorySql: BlogQueryRepositorySql,
        private userQueryRepositorySql: UserQueryRepositorySql,
        private blogRepositorySql: BlogRepositorySql
        // private userQueryRepository: UserQueryRepository,
        // private blogRepository: BlogRepository
    ) { }

    async execute(command: BindUserForBlogCommand): Promise<boolean> {
        const { userId, blogId } = command

        const user = await this.userQueryRepositorySql.findUserByIdForSa(userId)
        const blog = await this.blogQueryRepositorySql.findBlogFullById(blogId)
        if (!blog || !user) return false


        await this.blogRepositorySql.bindBlogForUser(user.id, blog.id)
        // blog.setUserId(userId)
        // await this.blogRepository.save(blog)

        return true
    }
}