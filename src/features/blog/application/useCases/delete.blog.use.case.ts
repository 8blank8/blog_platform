import { CommandHandler } from "@nestjs/cqrs";
import { BlogRepository } from "../../infrastructure/mongo/blog.repository";
import { BlogQueryRepository } from "../../infrastructure/mongo/blog.query.repository";
import { ForbiddenException } from "@nestjs/common";
import { BlogQueryRepositorySql } from "../../infrastructure/sql/blog.query.repository.sql";
import { BlogRepositorySql } from "../../infrastructure/sql/blog.repository.sql";
import { BlogRepositoryTypeorm } from "../../infrastructure/typeorm/blog.repository.typeorm";
import { BlogQueryRepositoryTypeorm } from "../../infrastructure/typeorm/blog.query.repository.typeorm";

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
        private blogRepository: BlogRepositoryTypeorm,
        private blogQueryRepository: BlogQueryRepositoryTypeorm
    ) { }

    async execute(command: DeleteBlogCommand): Promise<boolean> {

        const { id } = command

        const blog = await this.blogQueryRepository.findBlogViewById(id)
        if (!blog) return false

        // if (blog.userId !== userId) throw new ForbiddenException()

        const isDelete = await this.blogRepository.deleteBlogById(blog.id)
        if (!isDelete) return false

        return true
    }
}