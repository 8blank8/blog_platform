import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogDocument } from "./blog.schema";
import { Model } from "mongoose";
import { BlogDBType } from "./types/blog.db.type";
import { BlogViewType } from "./types/blog.view.type";
import { BlogQueryParamType } from "./types/blog.query.param.type";
import { QUERY_PARAM } from "../enum/query.param.enum";


@Injectable()
export class BlogQueryRepository {
    constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) { }

    async findAllBlogs(queryParam: BlogQueryParamType) {

        const {
            searchNameTerm = QUERY_PARAM.SEARCH_NAME_TERM,
            pageNumber = QUERY_PARAM.PAGE_NUMBER,
            pageSize = QUERY_PARAM.PAGE_SIZE,
            sortBy = QUERY_PARAM.SORT_BY,
            sortDirection = QUERY_PARAM.SORT_DIRECTION_DESC
        } = queryParam

        const filter: any = {}

        if (searchNameTerm) {
            const filterName = new RegExp(`${searchNameTerm}`, 'i')
            filter.name = { $regex: filterName }
        }

        const blogs = await this.blogModel.find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })
            .exec()

        const totalCount = await this.blogModel.countDocuments(filter)

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: blogs.map(this._mapBlog)
        }
    }

    async findBlogDocumentById(id: string): Promise<BlogDocument | null> {
        const blog = await this.blogModel.findOne({ id: id })
        if (!blog) return null
        return blog
    }

    async findBlogById(id: string): Promise<BlogViewType | null> {
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