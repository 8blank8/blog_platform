import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Auth, AuthDocument } from "../domain/auth.schema";
import { Model } from "mongoose";


@Injectable()
export class AuthRepository {
    constructor(@InjectModel(Auth.name) private authModel: Model<AuthDocument>) { }

    async postRefreshToken(token: { refreshToken: string }): Promise<AuthDocument> {
        return new this.authModel(token)
    }

    async save(token: AuthDocument) {
        return await token.save()
    }
}