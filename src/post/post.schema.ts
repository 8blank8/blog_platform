import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { v4 as uuidv4 } from 'uuid'

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

    addId() {
        this.id = uuidv4()
    }

    addBlogName(name: string) {
        this.blogName = name
    }
    addCreatedAt() {
        this.createdAt = new Date().toISOString()
    }
}

export const PostSchema = SchemaFactory.createForClass(Post)

PostSchema.methods = {
    addId: Post.prototype.addId,
    addBlogName: Post.prototype.addBlogName,
    addCreatedAt: Post.prototype.addCreatedAt
}

export type PostDocument = HydratedDocument<Post>
