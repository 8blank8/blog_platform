import { Injectable } from "@nestjs/common";
import { PostQueryRepository } from "./post.query.repository";
import { PostCreateType } from "./types/post.create.type";
import { PostRepository } from "./post.repository";
import { BlogQueryRepository } from "src/blog/blog.query.repository";


@Injectable()
export class PostService {
    constructor(
        private readonly postQueryRepository: PostQueryRepository,
        private readonly postRepository: PostRepository,
        private readonly blogQueryRepository: BlogQueryRepository
    ) { }

    async createPost(inputPostData: PostCreateType): Promise<boolean> {
        const blog = await this.blogQueryRepository.findBlogById(inputPostData.blogId)
        if (!blog) return false

        const newPost = await this.postRepository.createPost(inputPostData)
        newPost.addId()
        newPost.addBlogName(blog.name)
        newPost.addCreatedAt()

        await this.postRepository.save(newPost)

        return true
    }
}