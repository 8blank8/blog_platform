import { CommandHandler } from "@nestjs/cqrs";
// import { BlogQueryRepository } from "../../infrastructure/mongo/blog.query.repository";
// import { ForbiddenException } from "@nestjs/common";
// import { PostRepository } from "src/features/post/infrastructure/mongo/post.repository";
import { BlogQueryRepositorySql } from "../../infrastructure/sql/blog.query.repository.sql";
import { PostRepositorySql } from "../../../../features/post/infrastructure/sql/post.repository.sql";
import { PostQueryRepositorySql } from "../../../../features/post/infrastructure/sql/post.query.repository.sql";
import { BlogQueryRepositoryTypeorm } from "../../infrastructure/typeorm/blog.query.repository.typeorm";
import { PostRepositoryTypeorm } from "src/features/post/infrastructure/typeorm/post.repository.typeorm";
import { PostQueryRepositoryTypeorm } from "src/features/post/infrastructure/typeorm/post.query.repository.typeorm";


export class DeletePostByBlogIdCommand {
    constructor(
        // public userId: string,
        public postId: string,
        public blogId: string
    ) { }
}

@CommandHandler(DeletePostByBlogIdCommand)
export class DeletePostByBlogIdUseCase {
    constructor(
        // private blogQueryRepository: BlogQueryRepository,
        private blogQueryRepository: BlogQueryRepositoryTypeorm,
        private postRepository: PostRepositoryTypeorm,
        private postQueryrepository: PostQueryRepositoryTypeorm
        // private postRepository: PostRepository
    ) { }

    async execute(command: DeletePostByBlogIdCommand): Promise<boolean> {

        const { postId, blogId } = command

        const blog = await this.blogQueryRepository.findBlogViewById(blogId)
        const post = await this.postQueryrepository.findFullPostById(postId)
        if (!blog || !post) return false
        // if (userId !== blog.userId) throw new ForbiddenException()
        await this.postRepository.deletePostById(post.id)
        // const isDelete = await this.postRepositorySql.deletePostById(postId)
        return true
    }
} 