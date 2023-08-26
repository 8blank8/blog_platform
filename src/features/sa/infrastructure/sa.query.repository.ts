import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Blog, BlogDocument } from "src/features/blog/domain/blog.schema";
import { BlogDBType } from "src/features/blog/models/blog.db.type";
import { BlogViewModel } from "./models/blog.view.model";
import { User, UserDocument } from "src/features/user/domain/user.schema";
import { BlogQueryParamType } from "src/features/blog/models/blog.query.param.type";
import { QUERY_PARAM } from "src/entity/enum/query.param.enum";


@Injectable()
export class SaQueryRepository {
    constructor(
        @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

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
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: await Promise.all(blogs.map(item => this._mapBlog(item)))
        }
    }

    async _mapBlog(blog: BlogDocument): Promise<BlogViewModel> {

        const user = await this.userModel.findOne({ id: blog.userId })

        return {
            id: blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            isMembership: blog.isMembership,
            createdAt: blog.createdAt,
            blogOwnerInfo: {
                userId: user!.id,
                userLogin: user!.login
            },
            banInfo: {
                isBanned: blog.isBanned,
                banDate: blog.banDate
            }
        }
    }
}