import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
// import { LIKE_STATUS } from "src/entity/enums/like.status";
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
        default: 'None'
    })
    likeStatus: string

    @Prop({
        required: true
    })
    userId: string

    @Prop({
        default: false
    })
    userIsBanned: boolean

    @Prop({
        required: true
    })
    addedAt: string

    @Prop({
        required: true
    })
    userLogin: string

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

    addAddedAt() {
        this.addedAt = new Date().toISOString()
    }

    addUserLogin(login: string) {
        this.userLogin = login
    }

}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike)

CommentLikeSchema.methods = {
    updateLikeStatus: CommentLike.prototype.updateLikeStatus,
    addUserId: CommentLike.prototype.addUserId,
    addId: CommentLike.prototype.addId,
    addCommentId: CommentLike.prototype.addCommentId,
    addAddedAt: CommentLike.prototype.addAddedAt,
    addUserLogin: CommentLike.prototype.addUserLogin
}

export type CommentLikeDocument = HydratedDocument<CommentLike> 