import { CommandHandler } from "@nestjs/cqrs";
import { PostUpdateByIdModel } from "../../models/post.update.by.id";
import { BlogQueryRepository } from "../../infrastructure/mongo/blog.query.repository";
import { PostQueryRepository } from "src/features/post/infrastructure/mongo/post.query.repository";
import { ForbiddenException } from "@nestjs/common";
import { PostRepository } from "src/features/post/infrastructure/mongo/post.repository";
import { BlogQueryRepositorySql } from "../../infrastructure/sql/blog.query.repository.sql";
import { PostQueryRepositorySql } from "src/features/post/infrastructure/sql/post.query.repository.sql";
import { PostUpdateSqlModel } from "src/features/post/infrastructure/sql/models/post.update.sql.model";
import { PostRepositorySql } from "src/features/post/infrastructure/sql/post.repository.sql";


export class UpdatePostByBlogIdCommand {
    constructor(
        // public userId: string,
        public postId: string,
        public blogId: string,
        public inputData: PostUpdateByIdModel
    ) { }
}

@CommandHandler(UpdatePostByBlogIdCommand)
export class UpdatePostByBlogIdUseCase {
    constructor(
        // private blogQueryRepository: BlogQueryRepository,
        private blogQueryRepositorySql: BlogQueryRepositorySql,
        private postQueryRepositorySql: PostQueryRepositorySql,
        private postRepositorySql: PostRepositorySql
        // private postQueryRepository: PostQueryRepository,
        // private postRepository: PostRepository
    ) { }

    async execute(command: UpdatePostByBlogIdCommand): Promise<boolean> {

        const { postId, blogId, inputData } = command

        const blog = await this.blogQueryRepositorySql.findBlogFullById(blogId)
        const post = await this.postQueryRepositorySql.findPostFullById(postId)
        if (!blog || !post) return false
        // if (blog.userId !== userId) throw new ForbiddenException()

        const postUpdate: PostUpdateSqlModel = {
            ...inputData,
            blogId: blog.id,
            postId: post.id
        }

        await this.postRepositorySql.updatePostById(postUpdate)

        // post.updatePost(postUpdate)
        // await this.postRepository.savePost(post)

        return true
    }
}