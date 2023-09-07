import { CommandHandler } from "@nestjs/cqrs";
import { BlogRepository } from "../../infrastructure/mongo/blog.repository";
import { BlogQueryRepository } from "../../infrastructure/mongo/blog.query.repository";
import { ForbiddenException } from "@nestjs/common";
import { BlogQueryRepositorySql } from "../../infrastructure/sql/blog.query.repository.sql";
import { BlogRepositorySql } from "../../infrastructure/sql/blog.repository.sql";

export class DeleteBlogCommand {
    constructor(
        public id: string,
        // public userId: string
    ) { }
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase {
    constructor(
        // private blogRepository: BlogRepository,
        // private blogQueryRepository: BlogQueryRepository
        private blogRepositorySql: BlogRepositorySql,
        private blogQueryRepositorySql: BlogQueryRepositorySql
    ) { }

    async execute(command: DeleteBlogCommand): Promise<boolean> {

        const { id } = command

        const blog = await this.blogQueryRepositorySql.findBlogFullById(id)
        if (!blog) return false

        // if (blog.userId !== userId) throw new ForbiddenException()

        const isDelete = await this.blogRepositorySql.deleteBlogById(blog.id)
        if (!isDelete) return false

        return true
    }
}