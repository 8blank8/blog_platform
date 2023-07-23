import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./user.schema";
import { Model } from "mongoose";
import { UserViewType } from "./types/user.view.type";
import { UserDBType } from "./types/user.db.type";


@Injectable()
export class UserQueryRepository {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async findUserById(id: string): Promise<UserViewType | null> {
        const user = await this.userModel.findOne({ id: id })
        if (!user) return null

        return this._mapUser(user)
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