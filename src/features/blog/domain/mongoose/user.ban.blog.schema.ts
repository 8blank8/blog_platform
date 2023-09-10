import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { v4 as uuidv4 } from 'uuid'

@Schema()
export class UserBanBlog {
    @Prop({
        default: uuidv4()
    })
    id: string

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
    banReason: string

    @Prop({
        required: true
    })
    blogId: string

    @Prop({
        required: true
    })
    login: string

    @Prop({
        required: true
    })
    banDate: string

    setUserId(userId: string) {
        this.userId = userId
    }

    setUserLogin(login: string) {
        this.login = login
    }

    setBan(banReason: string, isBanned: boolean) {
        this.banReason = banReason
        this.isBanned = isBanned
    }

    setBlogId(blogId: string) {
        this.blogId = blogId
    }

    setBanDate() {
        this.banDate = new Date().toISOString()
    }
}

export const UserBanBlogSchema = SchemaFactory.createForClass(UserBanBlog)

UserBanBlogSchema.methods = {
    setUserId: UserBanBlog.prototype.setUserId,
    setBan: UserBanBlog.prototype.setBan,
    setBlogId: UserBanBlog.prototype.setBlogId,
    setUserLogin: UserBanBlog.prototype.setUserLogin,
    setBanDate: UserBanBlog.prototype.setBanDate
}

export type UserBanBlogDocument = HydratedDocument<UserBanBlog>