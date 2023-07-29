import { Injectable } from "@nestjs/common";
import { PostQueryRepository } from "../infrastructure/post.query.repository";
import { PostCreateType } from "../models/post.create.type";
import { PostRepository } from "../infrastructure/post.repository";
import { BlogQueryRepository } from "src/features/blog/infrastructure/blog.query.repository";
import { PostUpdateType } from "../models/post.update.type";


@Injectable()
export class PostService {
    constructor(
        private readonly postQueryRepository: PostQueryRepository,
        private readonly postRepository: PostRepository,
        private readonly blogQueryRepository: BlogQueryRepository
    ) { }

    async createPost(inputPostData: PostCreateType): Promise<string | null> {
        const blog = await this.blogQueryRepository.findBlogDocumentById(inputPostData.blogId)
        if (!blog) return null

        const newPost = await this.postRepository.createPost(inputPostData)
        newPost.addId()
        newPost.addBlogName(blog.name)
        newPost.addCreatedAt()

        await this.postRepository.save(newPost)

        return newPost.id
    }

    async updatePost(id: string, inputData: PostUpdateType): Promise<boolean> {
        const post = await this.postQueryRepository.findPostDocumentById(id)
        if (!post) return false

        post.updatePost(inputData)

        await this.postRepository.save(post)

        return true
    }

    async deletePost(id: string) {
        return this.postRepository.deletePost(id)
    }
}