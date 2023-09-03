import { CommandHandler } from "@nestjs/cqrs";
import { BlogBanInputDataModel } from "../../api/models/blog.ban.input.data.model";

import { BlogQueryRepository } from "src/features/blog/infrastructure/mongo/blog.query.repository";
import { BlogRepository } from "src/features/blog/infrastructure/mongo/blog.repository";
import { BlogQueryRepositorySql } from "src/features/blog/infrastructure/sql/blog.query.repository.sql";
import { BannedBlogCreateSqlModel } from "src/features/blog/infrastructure/sql/models/banned.blog.create.sql.model";
import { BlogRepositorySql } from "src/features/blog/infrastructure/sql/blog.repository.sql";


export class BlogBanCommand {
    constructor(
        public blogId: string,
        public inputData: BlogBanInputDataModel
    ) { }
}

@CommandHandler(BlogBanCommand)
export class BlogBanUseCase {
    constructor(
        // private blogQueryRepository: BlogQueryRepository,
        private blogQueryRepositorySql: BlogQueryRepositorySql,
        private blogRepositorySql: BlogRepositorySql
        // private blogRepository: BlogRepository
    ) { }

    async execute(command: BlogBanCommand) {
        const { inputData, blogId } = command

        const blog = await this.blogQueryRepositorySql.findBlogFullById(blogId)
        if (!blog) return false

        const bannedBlog = await this.blogQueryRepositorySql.findBannedBlogById(blogId)

        const updateBlog: BannedBlogCreateSqlModel = {
            blogId: blog.id,
            isBanned: inputData.isBanned
        }

        if (!bannedBlog) {
            await this.blogRepositorySql.createBanBlogById(updateBlog)
            return true
        }

        await this.blogRepositorySql.updateBanBlog(updateBlog)
        // blog.bannedBlog(inputData.isBanned)

        // await this.blogRepository.save(blog)

        return true
    }
}