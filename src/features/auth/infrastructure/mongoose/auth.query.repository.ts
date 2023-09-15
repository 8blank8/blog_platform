import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Auth, AuthDocument } from "../../domain/mongoose/auth.schema";
import { Model } from "mongoose";


@Injectable()
export class AuthQueryRepository {

    constructor(@InjectModel(Auth.name) private authModel: Model<AuthDocument>) { }

    async findRefreshToken(refreshToken: string): Promise<AuthDocument | null> {
        const token = await this.authModel.findOne({ refreshToken: refreshToken })
        return token
    }
}