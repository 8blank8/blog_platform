import { ForbiddenException, Injectable } from "@nestjs/common";
import { CommentQueryRepository } from "../infrastructure/comment.query.repository";
import { CommentRepository } from "../infrastructure/comment.repository";
import { CommentCreateType } from "../models/comment.create.type";
import { CommentLikeStatusType } from "../models/comment.like.status";


@Injectable()
export class CommentService {
    constructor(
        private readonly commentQueryRepository: CommentQueryRepository,
        private readonly commentRepository: CommentRepository
    ) { }

    async updateComment(inputData: CommentCreateType, commentId: string, userId: string): Promise<boolean> {
        const comment = await this.commentQueryRepository.findCommentById(commentId)
        if (!comment) return false

        if (comment.commentatorInfo.userId !== userId) throw new ForbiddenException()

        comment.updateContent(inputData.content)
        await this.commentRepository.saveComment(comment)

        return true
    }

    async deleteComment(id: string, userId: string): Promise<boolean> {
        const comment = await this.commentQueryRepository.findCommentById(id)
        if (!comment) return false

        if (comment.commentatorInfo.userId !== userId) throw new ForbiddenException()

        const isDelete = await this.commentRepository.deleteComment(id)
        return isDelete
    }

    async updateLikeStatus(id: string, inputData: CommentLikeStatusType, userId: string): Promise<boolean> {
        const like = await this.commentQueryRepository.findLikeByCommentId(id)
        if (like) {
            like.updateLikeStatus(inputData.likeStatus)
            await this.commentRepository.saveCommentLike(like)

            return true
        }

        const newLike = await this.commentRepository.createCommentLike(inputData)
        newLike.addCommentId(id)
        newLike.addUserId(userId)
        newLike.addId()

        await this.commentRepository.saveCommentLike(newLike)

        return true
    }
}