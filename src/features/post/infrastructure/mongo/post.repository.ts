import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLike,
  PostLikeDocument,
} from '@post/domain/mongoose/post.like.schema';
import { Post, PostDocument } from '@post/domain/mongoose/post.schema';
import { PostCreateType } from '@post/models/post.create.type';
import { PostLikeStatusType } from '@post/models/post.like.status.type';
import { Model } from 'mongoose';

@Injectable()
export class PostRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(PostLike.name) private postLikeModel: Model<PostLikeDocument>,
  ) {}

  async createPost(post: PostCreateType): Promise<PostDocument> {
    return new this.postModel(post);
  }

  async savePost(post: PostDocument) {
    return await post.save();
  }

  async deletePost(id: string) {
    const res = await this.postModel.deleteOne({ id: id });
    return res.deletedCount === 1;
  }

  async updateBanStatusPosts(userId: string, banStatus: boolean) {
    return await this.postModel.updateMany(
      { userId: userId },
      { $set: { userIsBanned: banStatus } },
    );
  }

  async deleteAllData() {
    return await this.postModel.deleteMany({});
  }

  async deleteAllLikes() {
    return await this.postLikeModel.deleteMany({});
  }

  async savePostLike(postLike: PostLikeDocument) {
    return await postLike.save();
  }

  async createPostLike(
    postLike: PostLikeStatusType,
  ): Promise<PostLikeDocument> {
    return new this.postLikeModel(postLike);
  }

  async updateBanStatusPostsLikeStatus(userId: string, banStatus: boolean) {
    return await this.postLikeModel.updateMany(
      { userId: userId },
      { $set: { userIsBanned: banStatus } },
    );
  }
}
