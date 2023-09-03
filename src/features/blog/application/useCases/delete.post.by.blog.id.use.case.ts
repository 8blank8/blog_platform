import { CommandHandler } from "@nestjs/cqrs";
import { BlogQueryRepository } from "../../infrastructure/mongo/blog.query.repository";
import { ForbiddenException } from "@nestjs/common";
import { PostRepository } from "src/features/post/infrastructure/mongo/post.repository";
import { BlogQueryRepositorySql } from "../../infrastructure/sql/blog.query.repository.sql";
import { PostRepositorySql } from "src/features/post/infrastructure/sql/post.repository.sql";


export class DeletePostByBlogIdCommand {
    constructor(
        public userId: string,
        public postId: string,
        public blogId: string
    ) { }
}

@CommandHandler(DeletePostByBlogIdCommand)
export class DeletePostByBlogIdUseCase {
    constructor(
        // private blogQueryRepository: BlogQueryRepository,
        private blogQueryRepositorySql: BlogQueryRepositorySql,
        private postRepositorySql: PostRepositorySql
        // private postRepository: PostRepository
    ) { }

    async execute(command: DeletePostByBlogIdCommand): Promise<boolean> {

        const { userId, postId, blogId } = command

        const blog = await this.blogQueryRepositorySql.findBlogFullById(blogId)
        if (!blog) return false
        if (userId !== blog.userId) throw new ForbiddenException()

        const isDelete = await this.postRepositorySql.deletePostById(postId)
        return isDelete
    }
}