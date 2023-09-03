import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { Comment, CommentDocument } from "../domain/comment.schema";
import { CommentQueryParam } from "../models/comment.query.param.type";
import { QUERY_PARAM } from "src/entity/enum/query.param.enum";
import { CommentLike, CommentLikeDocument } from "../domain/comment.like.schema";
import { CommentViewType } from "../models/comment.view.type";
import { PostQueryRepository } from "src/features/post/infrastructure/mongo/post.query.repository";
import { BlogQueryRepository } from "src/features/blog/infrastructure/mongo/blog.query.repository";
import { log } from "console";


@Injectable()
export class CommentQueryRepository {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
        @InjectModel(CommentLike.name) private commentLikeModel: Model<CommentLikeDocument>,
        private postQueryRepository: PostQueryRepository,
        private blogQueryRepository: BlogQueryRepository
    ) { }

    async findCommentsByPostId(queryParam: CommentQueryParam, postId: string, userId: string) {
        const {
            pageNumber = QUERY_PARAM.PAGE_NUMBER,
            pageSize = QUERY_PARAM.PAGE_SIZE,
            sortBy = QUERY_PARAM.SORT_BY,
            sortDirection = QUERY_PARAM.SORT_DIRECTION_DESC
        } = queryParam

        const comments = await this.commentModel.find({ postId: postId, "commentatorInfo.userIsBanned": false })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .sort({ [sortBy]: sortDirection })
            .exec()

        const totalCount = await this.commentModel.countDocuments({ postId: postId })

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: await Promise.all(comments.map(item => this._mapComment(item, userId))),
        }
    }

    async findCommentById(id: string): Promise<CommentDocument | null> {
        const comment = await this.commentModel.findOne({ id: id })
        return comment
    }

    async findCommentViewById(id: string, userId: string): Promise<CommentViewType | null> {
        const comment = await this.commentModel.findOne({ id: id, "commentatorInfo.userIsBanned": false })
        if (!comment) return null

        return await this._mapComment(comment, userId)
    }

    async findLikeByCommentId(id: string, userId: string): Promise<CommentLikeDocument | null> {
        const like = this.commentLikeModel.findOne({ commentId: id, userId: userId, userIsBanned: false })
        return like
    }

    async findAllCommentBlog(userId: string, queryParam: CommentQueryParam) {
        const {
            pageNumber = QUERY_PARAM.PAGE_NUMBER,
            pageSize = QUERY_PARAM.PAGE_SIZE,
            sortBy = QUERY_PARAM.SORT_BY,
            sortDirection = QUERY_PARAM.SORT_DIRECTION_DESC
        } = queryParam

        const blogs = await this.blogQueryRepository.findBlogsDocumentByUserId(userId)

        const blogIds = blogs.map(b => b.id)
        const filter: FilterQuery<CommentDocument> = { blogId: { $in: blogIds } }
        const comments = await this.commentModel.find(filter)
            .sort({ [sortBy]: sortDirection })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)


        const totalCount = await this.commentModel.countDocuments(filter)

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: totalCount,
            items: await Promise.all(comments.map(comment => this._mapCommentForAllPosts(comment, userId)))
        }
    }

    async _mapCommentForAllPosts(comment: CommentDocument, userId: string) {
        const likeCount = await this.commentLikeModel.countDocuments({ commentId: comment.id, likeStatus: 'Like', userIsBanned: false })
        const dislikeCount = await this.commentLikeModel.countDocuments({ commentId: comment.id, likeStatus: 'Dislike', userIsBanned: false })
        let myStatus: string = 'None'

        const likeStatus = await this.commentLikeModel.findOne({ commentId: comment.id, userId: userId, userIsBanned: false })

        if (likeStatus) {
            myStatus = likeStatus.likeStatus
        }

        const post = await this.postQueryRepository.findPostDocumentById(comment.postId)

        return {
            id: comment.id,
            content: comment.content,
            createdAt: comment.createdAt,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            likesInfo: {
                likesCount: likeCount,
                dislikesCount: dislikeCount,
                myStatus: myStatus
            },
            postInfo: {
                blogId: post!.blogId,
                blogName: post!.blogName,
                title: post!.title,
                id: post!.id
            }
        }

    }

    async _mapComment(comment: CommentDocument, userId: string): Promise<CommentViewType> {
        const likeCount = await this.commentLikeModel.countDocuments({ commentId: comment.id, likeStatus: 'Like', userIsBanned: false })
        const dislikeCount = await this.commentLikeModel.countDocuments({ commentId: comment.id, likeStatus: 'Dislike', userIsBanned: false })
        let myStatus: string = 'None'

        const likeStatus = await this.commentLikeModel.findOne({ commentId: comment.id, userId: userId, userIsBanned: false })

        if (likeStatus) {
            myStatus = likeStatus.likeStatus
        }

        return {
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: comment.commentatorInfo.userId,
                userLogin: comment.commentatorInfo.userLogin
            },
            createdAt: comment.createdAt,
            likesInfo: {
                likesCount: likeCount,
                dislikesCount: dislikeCount,
                myStatus: myStatus
            }
        }
    }
}