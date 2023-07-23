import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./user.schema";
import { Model } from "mongoose";
import { UserCreateType } from "./types/user.create.type";

@Injectable()
export class UserRepository {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

    async createUser(user: UserCreateType): Promise<UserDocument> {
        return new this.userModel(user)
    }

    async save(user: UserDocument) {
        return user.save()
    }
}