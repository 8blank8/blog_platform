import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogDocument } from "./blog.schema";
import { Model } from "mongoose";
import { BlogDBType } from "./types/blog.db.type";
import { BlogViewType } from "./types/blog.view.type";


@Injectable()
export class BlogQueryRepository {
    constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) { }

    async findAllBlogs() {
        const blogs = await this.blogModel.find({}).exec()
        return blogs.map(this._mapBlog)
    }

    async findBlogById(id: string) {
        const blog = await this.blogModel.findOne({ id: id })
        if (!blog) return null
        return this._mapBlog(blog)
    }

    _mapBlog(blog: BlogDBType): BlogViewType {
        return {
            id: blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            isMembership: blog.isMembership,
            createdAt: blog.createdAt
        }
    }
}