import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UserBanBlog, UserBanBlogDocument } from "../domain/user.ban.blog.schema";
import { Model } from "mongoose";
import { UsersBanQueryParamModel } from "../models/users.ban.query.param.model";
import { QUERY_PARAM } from "../../../entity/enum/query.param.enum";


@Injectable()
export class UserBanBlogQueryRepository {
    constructor(@InjectModel(UserBanBlog.name) private userBanBlogModel: Model<UserBanBlogDocument>) { }

    async findBannedUsers(blogId: string, queryParam: UsersBanQueryParamModel) {

        const {
            searchLoginTerm = QUERY_PARAM.SEARCH_NAME_TERM,
            pageNumber = QUERY_PARAM.PAGE_NUMBER,
            pageSize = QUERY_PARAM.PAGE_SIZE,
            sortBy = QUERY_PARAM.SORT_BY,
            sortDirection = QUERY_PARAM.SORT_DIRECTION_ASC
        } = queryParam

        const filter: any = { blogId: blogId, isBanned: true }

        if (searchLoginTerm) {
            const filterUserLogin = new RegExp(`${searchLoginTerm}`, 'i')
            filter.userLogin = { $regex: filterUserLogin }
        }
        console.log(filter)
        const bannedUsers = await this.userBanBlogModel.find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })

        const totalCount = await this.userBanBlogModel.countDocuments(filter)
        console.log(bannedUsers)
        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: bannedUsers.map(this._mapBannedUser)
        }
    }

    _mapBannedUser(bannedUser: UserBanBlogDocument) {
        console.log(bannedUser)
        return {
            id: bannedUser.userId,
            login: bannedUser.userLogin,
            banInfo: {
                isBanned: bannedUser.isBanned,
                banDate: bannedUser.banDate,
                banReason: bannedUser.banReason
            }
        }
    }
}