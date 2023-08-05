import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CommentDocument, Comment } from "../domain/comment.schema";
import { Model } from "mongoose";
import { CommentCreateType } from "../models/comment.create.type";
import { CommentLike, CommentLikeDocument } from "../domain/comment.like.schema";
import { CommentLikeStatusType } from "../models/comment.like.status";


@Injectable()
export class CommentRepository {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
        @InjectModel(CommentLike.name) private commentLikeModel: Model<CommentLikeDocument>
    ) { }

    async createComment(comment: CommentCreateType) {
        return new this.commentModel(comment)
    }

    async saveComment(comment: CommentDocument) {
        return await comment.save()
    }

    async deleteComment(id: string): Promise<boolean> {
        const res = await this.commentModel.deleteOne({ id: id })
        return res.deletedCount === 1
    }

    async saveCommentLike(commentLike: CommentLikeDocument) {
        return await commentLike.save()
    }

    async createCommentLike(like: CommentLikeStatusType) {
        return new this.commentLikeModel(like)
    }

}