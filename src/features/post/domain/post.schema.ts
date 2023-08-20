import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { v4 as uuidv4 } from 'uuid'
import { PostUpdateType } from "../models/post.update.type";

@Schema()
export class Post {
    @Prop({
        required: true
    })
    id: string

    @Prop({
        required: true
    })
    title: string

    @Prop({
        required: true
    })
    shortDescription: string

    @Prop({
        required: true
    })
    content: string

    @Prop({
        required: true
    })
    blogId: string

    @Prop({
        required: true
    })
    blogName: string

    @Prop({
        required: true
    })
    createdAt: string

    @Prop({
        required: true
    })

    userId: string

    @Prop({
        default: false
    })
    userIsBanned: boolean

    addId() {
        this.id = uuidv4()
    }

    addBlogName(name: string) {
        this.blogName = name
    }
    addCreatedAt() {
        this.createdAt = new Date().toISOString()
    }

    updatePost(inputData: PostUpdateType) {
        this.title = inputData.title
        this.shortDescription = inputData.shortDescription
        this.content = inputData.content
        this.blogId = inputData.blogId
    }

    setUserId(userId: string) {
        this.userId = userId
    }

    setUserIsBanned(ban: boolean) {
        this.userIsBanned = ban
    }
}

export const PostSchema = SchemaFactory.createForClass(Post)

PostSchema.methods = {
    addId: Post.prototype.addId,
    addBlogName: Post.prototype.addBlogName,
    addCreatedAt: Post.prototype.addCreatedAt,
    updatePost: Post.prototype.updatePost,
    setUserIsBanned: Post.prototype.setUserIsBanned,
    setUserId: Post.prototype.setUserId
}

export type PostDocument = HydratedDocument<Post>
