import { CommandHandler } from "@nestjs/cqrs"
import { BlogRepository } from "../../infrastructure/mongo/blog.repository"
import { BlogCreateType } from "../../models/blog.create.type"
import { UserQueryRepository } from "src/features/user/infrastructure/mongo/user.query.repository"
import { BlogCreateSqlModel } from "../../infrastructure/sql/models/blog.create.sql.model"
import { BlogRepositorySql } from "../../infrastructure/sql/blog.repository.sql"

export class CreateBlogCommand {
    constructor(
        public blog: BlogCreateType,
    ) { }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
    constructor(
        // private blogRepository: BlogRepository,
        private blogRepositorySql: BlogRepositorySql,
        // private userQueryRepository: UserQueryRepository
    ) { }

    async execute(command: CreateBlogCommand): Promise<string> {

        const { blog } = command

        // const createdBlog: BlogCreateSqlModel = {
        //     ...blog,
        //     userId: userId
        // }

        const blogId = await this.blogRepositorySql.createBlog(blog)
        // newBlog.addId()
        // newBlog.addCreatedAt()
        // newBlog.setUserId(userId)

        // await this.blogRepository.save(newBlog)
        return blogId
    }
}