import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Post, PostDocument } from "./post.schema";


@Injectable()
export class PostQueryRepository {
    constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) { }

    async findAllPosts(): Promise<PostDocument[]> {
        return this.postModel.find({}).exec()
    }
}