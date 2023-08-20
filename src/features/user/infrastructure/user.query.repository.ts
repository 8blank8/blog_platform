import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "../domain/user.schema";
import { Model } from "mongoose";
import { UserViewType } from "../models/user.view.type";
import { UserDBType } from "../models/user.db.type";
import { UserQueryParamType } from "../models/user.query.param.type";
import { QUERY_PARAM } from "../../../entity/enum/query.param.enum";


@Injectable()
export class UserQueryRepository {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>
    ) { }

    async findAllUsers(queryParam: UserQueryParamType) {

        const {
            sortBy = QUERY_PARAM.SORT_BY,
            sortDirection = QUERY_PARAM.SORT_DIRECTION_DESC,
            pageNumber = QUERY_PARAM.PAGE_NUMBER,
            pageSize = QUERY_PARAM.PAGE_SIZE,
            searchLoginTerm = QUERY_PARAM.SEARCH_NAME_TERM,
            searchEmailTerm = QUERY_PARAM.SEARCH_NAME_TERM,
            banStatus
        } = queryParam

        const filter: any = {
            $or: [

                { email: { $regex: RegExp(`${searchEmailTerm}`, 'i') } },
                { login: { $regex: RegExp(`${searchLoginTerm}`, 'i') } },
            ]
        }

        if (banStatus === QUERY_PARAM.BAN_STATUS_BANNED) {
            filter.$or.push({ "banInfo.isBanned": true })
        }

        if (banStatus === QUERY_PARAM.BAN_STATUS_NOT_BANNED) {
            filter.$or.push({ "banInfo.isBanned": false })
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

    async findUserDocumentById(id: string): Promise<UserDocument | null> {
        const user = await this.userModel.findOne({ id: id })
        return user
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument | null> {
        const user = await this.userModel.findOne({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] })
        return user
    }

    async findByEmail(email: string): Promise<UserDocument | null> {
        const user = await this.userModel.findOne({ email: email })
        return user
    }

    async findUserByConfirmationCode(code: string): Promise<UserDocument | null> {
        const user = await this.userModel.findOne({ confirmationCode: code })
        return user
    }

    async findMeView(userId: string) {
        const user = await this.userModel.findOne({ id: userId })
        if (!user) return null
        return this._mapUserForGetMe(user)
    }

    _mapUserForGetMe(user: UserDocument) {
        return {
            userId: user.id,
            login: user.login,
            email: user.email
        }
    }

    _mapUser(user: UserDocument): UserViewType {
        return {
            id: user.id,
            login: user.login,
            email: user.email,
            createdAt: user.createdAt,
            banInfo: {
                isBanned: user.isBanned,
                banDate: user.isBanned ? user.banDate : null,
                banReason: user.isBanned ? user.banReason : null
            }
        }
    }
}