import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogDocument } from "./blog.schema";
import { Model } from "mongoose";
import { BlogDBType } from "./types/blog.db.type";
import { BlogViewType } from "./types/blog.view.type";
import { BlogQueryParamType } from "./types/blog.query.param.type";
import { QUERY_PARAM } from "src/enum/query.param.enum";


@Injectable()
export class BlogQueryRepository {
    constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) { }

    async findAllBlogs(queryParam: BlogQueryParamType) {

        const filter: any = {}
        console.log(queryParam)

        if (queryParam.searchNameTerm) {
            // можно заполнить фильтр без if
            const filterName = new RegExp(`${QUERY_PARAM.SEARCH_NAME_TERM}`, 'i')
            filter.name = { $regex: filterName }
        }

        const blogs = await this.blogModel.find(filter).exec()

        return blogs.map(this._mapBlog)
    }

    async findBlogById(id: string): Promise<BlogDocument | null> {
        const blog = await this.blogModel.findOne({ id: id })
        if (!blog) return null
        return blog
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