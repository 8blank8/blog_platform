import { CommandHandler } from "@nestjs/cqrs";
import { PostRepository } from "../../infrastructure/post.repository";
import { BlogQueryRepository } from "src/features/blog/infrastructure/blog.query.repository";
import { PostCreateByIdType } from "src/features/blog/models/post.create.by.id.type";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { ForbiddenException } from "@nestjs/common";


export class CreatePostByBlogIdCommand {
    constructor(
        public inputPostData: PostCreateByIdType,
        public blogId: string,
        public userId: string
    ) { }
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase {
    constructor(
        private postRepository: PostRepository,
        private blogQueryRepository: BlogQueryRepository,
        private userQueryRepository: UserQueryRepository
    ) { }

    async execute(command: CreatePostByBlogIdCommand) {

        const { inputPostData, blogId, userId } = command

        const user = await this.userQueryRepository.findUserById(userId)
        if (!user) return null

        const blog = await this.blogQueryRepository.findBlogDocumentById(blogId)
        if (!blog) return null

        if (user.id !== blog.userId) throw new ForbiddenException()

        const post = {
            ...inputPostData,
            blogId
        }

        const newPost = await this.postRepository.createPost(post)
        newPost.addId()
        newPost.addBlogName(blog.name)
        newPost.addCreatedAt()
        newPost.setUserId(blog.userId)

        await this.postRepository.savePost(newPost)

        return newPost.id
    }
}
