import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PostCreateType } from "./types/post.create.type";
import { Post, PostDocument } from "./post.schema";

@Injectable()
export class PostRepository {
    constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) { }

    async createPost(post: PostCreateType): Promise<PostDocument> {
        return new this.postModel(post)
    }

    async save(post: PostDocument) {
        return await post.save()
    }
}
