import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { BlogUpdateType } from '../models/blog.update.type'


@Schema()
export class Blog {
    @Prop({
        required: true
    })
    id: string

    @Prop({
        required: true
    })
    name: string

    @Prop({
        required: true
    })
    description: string

    @Prop({
        required: true
    })
    websiteUrl: string

    @Prop({
        required: true
    })
    createdAt: string

    @Prop({
        default: false
    })
    isMembership: boolean

    @Prop({
        required: true
    })
    userId: string

    @Prop({
        default: false
    })
    isBanned: boolean


    @Prop({
        default: null
    })
    banDate: string

    bannedBlog(isBanned: boolean) {
        this.isBanned = isBanned
        this.banDate = new Date().toISOString()
    }

    addCreatedAt() {
        this.createdAt = new Date().toISOString()
    }

    addId() {
        this.id = uuidv4()
    }

    updateBlog(data: BlogUpdateType) {
        this.name = data.name
        this.description = data.description
        this.websiteUrl = data.websiteUrl
    }

    setUserId(userId: string) {
        this.userId = userId
    }
}

export const BlogSchema = SchemaFactory.createForClass(Blog)

BlogSchema.methods = {
    addCreatedAt: Blog.prototype.addCreatedAt,
    addId: Blog.prototype.addId,
    updateBlog: Blog.prototype.updateBlog,
    setUserId: Blog.prototype.setUserId,
    bannedBlog: Blog.prototype.bannedBlog
}

export type BlogDocument = HydratedDocument<Blog>
