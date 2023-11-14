import {
  CommentLike,
  CommentLikeDocument,
} from '@comment/domain/mongoose/comment.like.schema';
import {
  CommentDocument,
  Comment,
} from '@comment/domain/mongoose/comment.schema';
import { CommentCreateType } from '@comment/models/comment.create.type';
import { CommentLikeStatusType } from '@comment/models/comment.like.status';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(CommentLike.name)
    private commentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async createComment(comment: CommentCreateType) {
    return new this.commentModel(comment);
  }

  async saveComment(comment: CommentDocument) {
    return await comment.save();
  }

  async deleteComment(id: string): Promise<boolean> {
    const res = await this.commentModel.deleteOne({ id: id });
    return res.deletedCount === 1;
  }

  async updateBanStatusComments(userId: string, banStatus: boolean) {
    return await this.commentModel.updateMany(
      { 'commentatorInfo.userId': userId },
      { $set: { 'commentatorInfo.userIsBanned': banStatus } },
    );
  }

  async saveCommentLike(commentLike: CommentLikeDocument) {
    return await commentLike.save();
  }

  async createCommentLike(like: CommentLikeStatusType) {
    return new this.commentLikeModel(like);
  }

  async deleteAllCommentsLike() {
    return await this.commentLikeModel.deleteMany({});
  }

  async updateBanStatusCommentsLikeStatus(userId: string, banStatus: boolean) {
    return await this.commentLikeModel.updateMany(
      { userId: userId },
      { $set: { userIsBanned: banStatus } },
    );
  }

  async deleteAllComments() {
    return await this.commentModel.deleteMany({});
  }
}
