import { CommandHandler } from "@nestjs/cqrs";
import { PostUpdateByIdModel } from "../../models/post.update.by.id";
import { BlogQueryRepository } from "../../infrastructure/blog.query.repository";
import { PostQueryRepository } from "src/features/post/infrastructure/post.query.repository";
import { ForbiddenException } from "@nestjs/common";
import { PostRepository } from "src/features/post/infrastructure/post.repository";


export class UpdatePostByBlogIdCommand {
    constructor(
        public userId: string,
        public postId: string,
        public blogId: string,
        public inputData: PostUpdateByIdModel
    ) { }
}

@CommandHandler(UpdatePostByBlogIdCommand)
export class UpdatePostByBlogIdUseCase {
    constructor(
        private blogQueryRepository: BlogQueryRepository,
        private postQueryRepository: PostQueryRepository,
        private postRepository: PostRepository
    ) { }

    async execute(command: UpdatePostByBlogIdCommand): Promise<boolean> {

        const { userId, postId, blogId, inputData } = command

        const blog = await this.blogQueryRepository.findBlogDocumentById(blogId)
        const post = await this.postQueryRepository.findPostDocumentById(postId)
        if (!blog || !post) return false
        if (blog.userId !== userId) new ForbiddenException()

        const postUpdate = {
            ...inputData,
            blogId: blog.id
        }

        post.updatePost(postUpdate)
        await this.postRepository.savePost(post)

        return true
    }
}