import { CommandHandler } from "@nestjs/cqrs";
import { BlogBanInputDataModel } from "../../api/models/blog.ban.input.data.model";
import { BlogQueryRepositorySql } from "../../../../features/blog/infrastructure/sql/blog.query.repository.sql";
import { BannedBlogCreateSqlModel } from "../../../../features/blog/infrastructure/sql/models/banned.blog.create.sql.model";
import { BlogRepositorySql } from "../../../../features/blog/infrastructure/sql/blog.repository.sql";


export class BlogBanCommand {
    constructor(
        public blogId: string,
        public inputData: BlogBanInputDataModel
    ) { }
}

@CommandHandler(BlogBanCommand)
export class BlogBanUseCase {
    constructor(
        private blogQueryRepositorySql: BlogQueryRepositorySql,
        private blogRepositorySql: BlogRepositorySql
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

        return true
    }
}