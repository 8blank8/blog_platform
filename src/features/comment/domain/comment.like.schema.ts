import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { LIKE_STATUS } from "src/entity/enums/like.status";
import { v4 as uuidv4 } from 'uuid'


@Schema()
export class CommentLike {

    @Prop({
        required: true
    })
    id: string

    @Prop({
        required: true
    })
    commentId: string

    @Prop({
        default: LIKE_STATUS.NONE
    })
    likeStatus: string

    @Prop({
        required: true
    })
    userId: string

    updateLikeStatus(likeStatus: string) {
        this.likeStatus = likeStatus
    }

    addUserId(userId: string) {
        this.userId = userId
    }

    addId() {
        this.id = uuidv4()
    }

    addCommentId(commentId: string) {
        this.commentId = commentId
    }
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike)

CommentLikeSchema.methods = {
    updateLikeStatus: CommentLike.prototype.updateLikeStatus,
    addUserId: CommentLike.prototype.addUserId,
    addId: CommentLike.prototype.addId,
    addCommentId: CommentLike.prototype.addCommentId
}

export type CommentLikeDocument = HydratedDocument<CommentLike> 