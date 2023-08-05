import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { UserDocument } from "src/features/user/domain/user.schema";
import { v4 as uuidv4 } from 'uuid'

class CommentatorInfo {
    @Prop({
        required: true
    })
    userId: string

    @Prop({
        required: true
    })
    userLogin: string
}

@Schema()
export class Comment {
    @Prop({
        required: true
    })
    id: string

    @Prop({
        required: true
    })
    content: string

    @Prop({
        required: true,
    })
    commentatorInfo: CommentatorInfo

    @Prop({
        required: true
    })
    createdAt: string

    addCreatedAt() {
        this.createdAt = new Date().toISOString()
    }

    addId() {
        this.id = uuidv4()
    }

    addCommentatorInfo(user: UserDocument) {
        this.commentatorInfo = {
            userId: user.id,
            userLogin: user.login
        }
    }

    updateContent(inputData: string) {
        this.content = inputData
    }
}

export const CommentSchema = SchemaFactory.createForClass(Comment)

CommentSchema.methods = {
    addCreatedAt: Comment.prototype.addCreatedAt,
    addId: Comment.prototype.addId,
    addCommentatorInfo: Comment.prototype.addCommentatorInfo,
    updateContent: Comment.prototype.updateContent
}

export type CommentDocument = HydratedDocument<Comment>
