import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PostCreateType } from "../../models/post.create.type";
import { Post, PostDocument } from "../../domain/post.schema";
import { PostLike, PostLikeDocument } from "../../domain/post.like.schema";
import { PostLikeStatusType } from "../../models/post.like.status.type";

@Injectable()
export class PostRepository {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
        @InjectModel(PostLike.name) private postLikeModel: Model<PostLikeDocument>
    ) { }

    async createPost(post: PostCreateType): Promise<PostDocument> {
        return new this.postModel(post)
    }

    async savePost(post: PostDocument) {
        return await post.save()
    }

    async deletePost(id: string) {
        const res = await this.postModel.deleteOne({ id: id })
        return res.deletedCount === 1
    }

    async updateBanStatusPosts(userId: string, banStatus: boolean) {
        return await this.postModel.updateMany({ userId: userId }, { $set: { userIsBanned: banStatus } })
    }

    async deleteAllData() {
        return await this.postModel.deleteMany({})
    }

    async deleteAllLikes() {
        return await this.postLikeModel.deleteMany({})
    }

    async savePostLike(postLike: PostLikeDocument) {
        return await postLike.save()
    }

    async createPostLike(postLike: PostLikeStatusType): Promise<PostLikeDocument> {
        return new this.postLikeModel(postLike)
    }

    async updateBanStatusPostsLikeStatus(userId: string, banStatus: boolean) {
        return await this.postLikeModel.updateMany({ userId: userId }, { $set: { userIsBanned: banStatus } })
    }
}
