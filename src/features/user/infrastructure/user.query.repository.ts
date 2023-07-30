import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../domain/user.schema";
import { Model } from "mongoose";
import { UserViewType } from "../models/user.view.type";
import { UserDBType } from "../models/user.db.type";
import { UserQueryParamType } from "../models/user.query.param.type";
import { QUERY_PARAM } from "../../enum/query.param.enum";


@Injectable()
export class UserQueryRepository {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async findAllUsers(queryParam: UserQueryParamType) {

        const {
            sortBy = QUERY_PARAM.SORT_BY,
            sortDirection = QUERY_PARAM.SORT_DIRECTION_DESC,
            pageNumber = QUERY_PARAM.PAGE_NUMBER,
            pageSize = QUERY_PARAM.PAGE_SIZE,
            searchLoginTerm = QUERY_PARAM.SEARCH_NAME_TERM,
            searchEmailTerm = QUERY_PARAM.SEARCH_NAME_TERM
        } = queryParam

        console.log(searchEmailTerm)
        const filter: any = {
            $or: [
                { email: { $regex: RegExp(`${searchEmailTerm}`, 'i') } },
                { login: { $regex: RegExp(`${searchLoginTerm}`, 'i') } },

            ]
        }

        const users = await this.userModel.find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })
            .exec()

        const totalCount = await this.userModel.countDocuments(filter)

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: users.map(this._mapUser)
        }
    }

    async findUserById(id: string): Promise<UserViewType | null> {
        const user = await this.userModel.findOne({ id: id })
        if (!user) return null

        return this._mapUser(user)
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
        const user = this.userModel.findOne({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] })
        return user
    }

    _mapUser(user: UserDBType): UserViewType {
        return {
            id: user.id,
            login: user.login,
            email: user.email,
            createdAt: user.createdAt
        }
    }
}