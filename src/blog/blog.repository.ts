import { Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose'
import { Blog, BlogDocument } from "./blog.schema";
import { Model } from "mongoose";
import { BlogCreateType } from "./types/blog.create.type";


@Injectable()
export class BlogRepository {
    constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) { }

    async createBlog(blog: BlogCreateType) {
        const createBlog = new this.blogModel(blog)
        createBlog.addId()
        createBlog.addCreatedAt()
        createBlog.save()
        return createBlog.id
    }


}