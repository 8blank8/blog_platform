import { CommandHandler } from "@nestjs/cqrs";
import { BlogUpdateType } from "../../models/blog.update.type";
import { BlogRepository } from "../../infrastructure/mongo/blog.repository";
import { BlogQueryRepository } from "../../infrastructure/mongo/blog.query.repository";
import { ForbiddenException } from "@nestjs/common";
import { BlogQueryRepositorySql } from "../../infrastructure/sql/blog.query.repository.sql";
import { BlogRepositorySql } from "../../infrastructure/sql/blog.repository.sql";
import { BlogUpdateSqlModel } from "../../infrastructure/sql/models/blog.update.sql.model";
import { BlogRepositoryTypeorm } from "../../infrastructure/typeorm/blog.repository.typeorm";
import { BlogQueryRepositoryTypeorm } from "../../infrastructure/typeorm/blog.query.repository.typeorm";

export class UpdateBlogCommand {
    constructor(
        public updateData: BlogUpdateType,
        public id: string,
        // public userId: string
    ) { }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase {

    constructor(
        // private blogRepository: BlogRepository,
        // private blogQueryRepository: BlogQueryRepository
        private blogRepository: BlogRepositoryTypeorm,
        private blogQueryRepository: BlogQueryRepositoryTypeorm
    ) { }

    async execute(command: UpdateBlogCommand) {

        const { updateData, id } = command

        const blog = await this.blogQueryRepository.findBlogViewById(id)
        if (!blog) return false

        // if (blog.userId !== userId) throw new ForbiddenException()

        // const updatedBlog: BlogUpdateSqlModel = {
        //     name: updateData.name,
        //     description: updateData.description,
        //     websiteUrl: updateData.websiteUrl,
        //     blogId: id
        // }

        blog.name = updateData.name
        blog.description = updateData.description
        blog.websiteUrl = updateData.websiteUrl

        await this.blogRepository.saveBlog(blog)

        // await this.blogRepositorySql.updateBlogById(updatedBlog)

        return true
        // blog.updateBlog(command.updateData)

        // return this.blogRepository.save(blog)
    }
}