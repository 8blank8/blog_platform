import { CommandHandler } from "@nestjs/cqrs";
import { BlogQueryRepository } from "../../infrastructure/blog.query.repository";
import { ForbiddenException } from "@nestjs/common";
import { PostRepository } from "src/features/post/infrastructure/post.repository";


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
        private blogQueryRepository: BlogQueryRepository,
        private postRepository: PostRepository
    ) { }

    async execute(command: DeletePostByBlogIdCommand): Promise<boolean> {

        const { userId, postId, blogId } = command

        const blog = await this.blogQueryRepository.findBlogDocumentById(blogId)
        if (!blog) return false
        if (userId !== blog.userId) throw new ForbiddenException()

        const isDelete = await this.postRepository.deletePost(postId)
        return isDelete
    }
}