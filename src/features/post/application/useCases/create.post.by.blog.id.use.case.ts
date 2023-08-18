import { CommandHandler } from "@nestjs/cqrs";
import { PostRepository } from "../../infrastructure/post.repository";
import { BlogQueryRepository } from "src/features/blog/infrastructure/blog.query.repository";
import { PostCreateByIdType } from "src/features/blog/models/post.create.by.id.type";


export class CreatePostByBlogIdCommand {
    constructor(
        public inputPostData: PostCreateByIdType,
        public blogId: string
    ) { }
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase {
    constructor(
        private postRepository: PostRepository,
        private blogQueryRepository: BlogQueryRepository,
    ) { }

    async execute(command: CreatePostByBlogIdCommand): Promise<string | null> {

        const { inputPostData, blogId } = command

        const blog = await this.blogQueryRepository.findBlogDocumentById(blogId)
        if (!blog) return null

        const post = {
            ...inputPostData,
            blogId
        }

        const newPost = await this.postRepository.createPost(post)
        newPost.addId()
        newPost.addBlogName(blog.name)
        newPost.addCreatedAt()

        await this.postRepository.savePost(newPost)

        return newPost.id
    }
}
