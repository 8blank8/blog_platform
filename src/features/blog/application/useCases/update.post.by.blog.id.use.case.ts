import { CommandHandler } from "@nestjs/cqrs";
import { PostUpdateByIdModel } from "../../models/post.update.by.id";
// import { BlogQueryRepository } from "../../infrastructure/mongo/blog.query.repository";
// import { PostQueryRepository } from "src/features/post/infrastructure/mongo/post.query.repository";
// import { ForbiddenException } from "@nestjs/common";
// import { PostRepository } from "src/features/post/infrastructure/mongo/post.repository";
import { BlogQueryRepositorySql } from "../../infrastructure/sql/blog.query.repository.sql";
import { PostQueryRepositorySql } from "../../../../features/post/infrastructure/sql/post.query.repository.sql";
import { PostUpdateSqlModel } from "../../../../features/post/infrastructure/sql/models/post.update.sql.model";
import { PostRepositorySql } from "../../../../features/post/infrastructure/sql/post.repository.sql";
import { BlogQueryRepositoryTypeorm } from "../../infrastructure/typeorm/blog.query.repository.typeorm";
import { PostQueryRepositoryTypeorm } from "../../../../features/post/infrastructure/typeorm/post.query.repository.typeorm";
import { PostRepositoryTypeorm } from "../../../../features/post/infrastructure/typeorm/post.repository.typeorm";


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
        private blogQueryRepository: BlogQueryRepositoryTypeorm,
        private postQueryRepository: PostQueryRepositoryTypeorm,
        private postRepository: PostRepositoryTypeorm
        // private postQueryRepository: PostQueryRepository,
        // private postRepository: PostRepository
    ) { }

    async execute(command: UpdatePostByBlogIdCommand): Promise<boolean> {

        const { postId, blogId, inputData } = command

        const blog = await this.blogQueryRepository.findBlogViewById(blogId)
        const post = await this.postQueryRepository.findFullPostById(postId)
        if (!blog || !post) return false
        // if (blog.userId !== userId) throw new ForbiddenException()

        // const postUpdate: PostUpdateSqlModel = {
        //     ...inputData,
        //     blogId: blog.id,
        //     postId: post.id
        // }

        post.title = inputData.title
        post.content = inputData.content
        post.shortDescription = inputData.shortDescription

        await this.postRepository.savePost(post)
        // await this.postRepositorySql.updatePostById(postUpdate)

        // post.updatePost(postUpdate)
        // await this.postRepository.savePost(post)

        return true
    }
}