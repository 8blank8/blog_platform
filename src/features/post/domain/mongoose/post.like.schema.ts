import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { v4 as uuidv4 } from 'uuid'


@Schema()
export class PostLike {
    @Prop({
        required: true
    })
    id: string

    @Prop({
        default: 'None'
    })
    likeStatus: string

    @Prop({
        required: true
    })
    postId: string

    @Prop({
        required: true
    })
    userId: string

    @Prop({
        required: true
    })
    userLogin: string

    @Prop({
        required: true
    })
    addedAt: string

    @Prop({
        default: false
    })
    userIsBanned: boolean

    addId() {
        this.id = uuidv4()
    }

    updateLikeStatus(likeStatus: string) {
        this.likeStatus = likeStatus
    }

    addPostId(postId: string) {
        this.postId = postId
    }

    addUserId(userId: string) {
        this.userId = userId
    }

    addUserLogin(login: string) {
        this.userLogin = login
    }

    addAddedAt() {
        this.addedAt = new Date().toISOString()
    }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike)

PostLikeSchema.methods = {
    addId: PostLike.prototype.addId,
    updateLikeStatus: PostLike.prototype.updateLikeStatus,
    addPostId: PostLike.prototype.addPostId,
    addUserId: PostLike.prototype.addUserId,
    addUserLogin: PostLike.prototype.addUserLogin,
    addAddedAt: PostLike.prototype.addAddedAt
}

export type PostLikeDocument = HydratedDocument<PostLike>