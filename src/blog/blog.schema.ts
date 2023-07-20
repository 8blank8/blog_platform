import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { BlogUpdateType } from './types/blog.update.type'


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
        default: true
    })
    isMembership: boolean


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
}

export type BlogDocument = HydratedDocument<Blog>

export const BlogSchema = SchemaFactory.createForClass(Blog)

BlogSchema.methods = {
    addCreatedAt: Blog.prototype.addCreatedAt,
    addId: Blog.prototype.addId,
    updateBlog: Blog.prototype.updateBlog
}


// "id": "string",
//       "name": "string",
//       "description": "string",
//       "websiteUrl": "string",
//       "createdAt": "2023-07-20T06:45:54.097Z",
//       "isMembership": true