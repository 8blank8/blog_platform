import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Comment, CommentDocument } from "../domain/comment.schema";
import { CommentQueryParam } from "../models/comment.query.param.type";
import { QUERY_PARAM } from "src/features/enum/query.param.enum";
import { CommentLike, CommentLikeDocument } from "../domain/comment.like.schema";


@Injectable()
export class CommentQueryRepository {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
        @InjectModel(CommentLike.name) private commentLikeModel: Model<CommentLikeDocument>
    ) { }

    async findCommentsByPostId(queryParam: CommentQueryParam, postId: string) {
        const {
            pageNumber = QUERY_PARAM.PAGE_NUMBER,
            pageSize = QUERY_PARAM.PAGE_SIZE,
            sortBy = QUERY_PARAM.SORT_BY,
            sortDirection = QUERY_PARAM.SORT_DIRECTION_DESC
        } = queryParam

        const comments = await this.commentModel.find({})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })
            .exec()

        const totalCount = await this.commentModel.countDocuments({})

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: comments,
        }
    }

    async findCommentById(id: string): Promise<CommentDocument | null> {
        const comment = await this.commentModel.findOne({ id: id })
        return comment
    }

    async findLikeByCommentId(id: string): Promise<CommentLikeDocument | null> {
        const like = this.commentLikeModel.findOne({ id: id })
        return like
    }
}