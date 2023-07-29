import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Post, PostDocument } from "../domain/post.schema";
import { PostQueryParamType } from "../models/post.query.param.type";
import { QUERY_PARAM } from "../../enum/query.param.enum";
import { PostViewType } from "../models/post.view.type";


@Injectable()
export class PostQueryRepository {
    constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) { }

    async findPosts(queryParam: PostQueryParamType, blogId?: string) {

        const {
            pageNumber = QUERY_PARAM.PAGE_NUMBER,
            pageSize = QUERY_PARAM.PAGE_SIZE,
            sortBy = QUERY_PARAM.SORT_BY,
            sortDirection = QUERY_PARAM.SORT_DIRECTION_DESC
        } = queryParam

        const filter: any = {}

        if (blogId) {
            filter.blogId = blogId
        }

        const posts = await this.postModel.find(filter)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })
            .exec()

        const totalCount = await this.postModel.countDocuments(filter)

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: posts.map(this._mapPost),

        }

    }

    async findPost(id: string): Promise<PostViewType | null> {
        const post = await this.postModel.findOne({ id: id }).exec()
        if (!post) return null

        return this._mapPost(post)
    }

    async findPostDocumentById(id: string): Promise<PostDocument | null> {
        return this.postModel.findOne({ id: id })
    }

    _mapPost(post: PostDocument): PostViewType {
        return {
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: "None",
                newestLikes: [
                    {
                        addedAt: "2023-07-23T16:22:01.776Z",
                        userId: "string",
                        login: "string"
                    }
                ]
            }
        }
    }
}