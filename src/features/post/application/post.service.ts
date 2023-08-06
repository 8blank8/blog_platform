import { Injectable } from "@nestjs/common";
import { PostQueryRepository } from "../infrastructure/post.query.repository";
import { PostCreateType } from "../models/post.create.type";
import { PostRepository } from "../infrastructure/post.repository";
import { BlogQueryRepository } from "src/features/blog/infrastructure/blog.query.repository";
import { PostUpdateType } from "../models/post.update.type";
import { CommentCreateType } from "src/features/comment/models/comment.create.type";
import { CommentRepository } from "src/features/comment/infrastructure/comment.repository";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { PostLikeStatusType } from "../models/post.like.status.type";
import { PostCreateByIdType } from "src/features/blog/models/post.create.by.id.type";

@Injectable()
export class PostService {
    constructor(
        private readonly postQueryRepository: PostQueryRepository,
        private readonly postRepository: PostRepository,
        private readonly blogQueryRepository: BlogQueryRepository,
        private readonly commentRepository: CommentRepository,
        private readonly userQueryRepository: UserQueryRepository
    ) { }

    async createPost(inputPostData: PostCreateType): Promise<string | null> {
        const blog = await this.blogQueryRepository.findBlogDocumentById(inputPostData.blogId)
        if (!blog) return null

        const newPost = await this.postRepository.createPost(inputPostData)
        newPost.addId()
        newPost.addBlogName(blog.name)
        newPost.addCreatedAt()

        await this.postRepository.savePost(newPost)

        return newPost.id
    }

    async createPostByIdBlog(inputPostData: PostCreateByIdType, blogId: string): Promise<string | null> {
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

    async updatePost(id: string, inputData: PostUpdateType): Promise<boolean> {
        const post = await this.postQueryRepository.findPostDocumentById(id)
        if (!post) return false

        post.updatePost(inputData)

        await this.postRepository.savePost(post)

        return true
    }

    async deletePost(id: string) {
        return this.postRepository.deletePost(id)
    }

    async createComment(id: string, inputData: CommentCreateType, userId: string): Promise<boolean> {
        const post = await this.postQueryRepository.findPost(id)
        if (!post) return false

        const user = await this.userQueryRepository.findUserDocumentById(userId)
        if (!user) return false

        const comment = await this.commentRepository.createComment(inputData)
        comment.addId()
        comment.addCreatedAt()
        comment.addCommentatorInfo(user)

        await this.commentRepository.saveComment(comment)

        return true
    }

    async updatePostLikeStatus(id: string, inputData: PostLikeStatusType, userId: string): Promise<boolean> {
        const post = await this.postQueryRepository.findPost(id)
        if (!post) return false

        const user = await this.userQueryRepository.findUserDocumentById(userId)
        if (!user) return false

        const like = await this.postQueryRepository.findPostLikeStatus(id)
        if (like) {
            like.updateLikeStatus(inputData.likeStatus)
            await this.postRepository.savePostLike(like)

            return true
        }

        const newLike = await this.postRepository.createPostLike(inputData)
        newLike.addId()
        newLike.addPostId(id)
        newLike.addUserId(user.id)
        newLike.addAddedAt()
        newLike.addUserLogin(user.login)

        await this.postRepository.savePostLike(newLike)

        return true
    }
}