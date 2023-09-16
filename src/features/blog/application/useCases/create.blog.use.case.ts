import { CommandHandler } from "@nestjs/cqrs"
import { BlogRepository } from "../../infrastructure/mongo/blog.repository"
import { BlogCreateType } from "../../models/blog.create.type"
import { UserQueryRepository } from "src/features/user/infrastructure/mongo/user.query.repository"
import { BlogCreateSqlModel } from "../../infrastructure/sql/models/blog.create.sql.model"
import { BlogRepositorySql } from "../../infrastructure/sql/blog.repository.sql"
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
        // private blogRepository: BlogRepository,
        private blogRepository: BlogRepositoryTypeorm,
        // private userQueryRepository: UserQueryRepository
    ) { }

    async execute(command: CreateBlogCommand): Promise<string> {

        const { blog } = command

        // const createdBlog: BlogCreateSqlModel = {
        //     ...blog,
        //     userId: userId
        // }

        const createdBlog = new Blogs()
        createdBlog.name = blog.name
        createdBlog.description = blog.description
        createdBlog.websiteUrl = blog.websiteUrl

        await this.blogRepository.saveBlog(createdBlog)

        // const blogId = await this.blogRepository.createBlog(blog)

        // newBlog.addId()
        // newBlog.addCreatedAt()
        // newBlog.setUserId(userId)

        // await this.blogRepository.save(newBlog)
        return createdBlog.id
    }
}