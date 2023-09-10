import { CommandHandler } from "@nestjs/cqrs";
// import { BlogQueryRepository } from "../../infrastructure/mongo/blog.query.repository";
// import { ForbiddenException } from "@nestjs/common";
// import { PostRepository } from "src/features/post/infrastructure/mongo/post.repository";
import { BlogQueryRepositorySql } from "../../infrastructure/sql/blog.query.repository.sql";
import { PostRepositorySql } from "../../../../features/post/infrastructure/sql/post.repository.sql";
import { PostQueryRepositorySql } from "../../../../features/post/infrastructure/sql/post.query.repository.sql";


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
        private blogQueryRepositorySql: BlogQueryRepositorySql,
        private postRepositorySql: PostRepositorySql,
        private postQueryrepositorySql: PostQueryRepositorySql
        // private postRepository: PostRepository
    ) { }

    async execute(command: DeletePostByBlogIdCommand): Promise<boolean> {

        const { postId, blogId } = command

        const blog = await this.blogQueryRepositorySql.findBlogFullById(blogId)
        const post = await this.postQueryrepositorySql.findPostFullById(postId)
        if (!blog || !post) return false
        // if (userId !== blog.userId) throw new ForbiddenException()

        const isDelete = await this.postRepositorySql.deletePostById(postId)
        return isDelete
    }
} 