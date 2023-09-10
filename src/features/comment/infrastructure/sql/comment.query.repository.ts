import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentViewSqlModel } from "./models/comment.view.sql.model";
import { CommentQueryParam } from "../../models/comment.query.param.type";
import { QUERY_PARAM_SQL } from "../../../../entity/enum/query.param.enum.sql";
import { CommentLikeViewSqlModel } from "./models/comment.like.view.sql.model";
import { CommentFullSqlModel } from "./models/comment.full.sql.model";


@Injectable()
export class CommentQueryRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async findCommentFullById(commentId: string): Promise<CommentFullSqlModel> {
        const comment = await this.dataSource.query(`
            SELECT pc."Id", pc."UserId", pc."Content", pc."PostId", pc."CreatedAt", 
                pc."BlogId"
            FROM public."PostComments" as pc
            WHERE pc."Id" = $1
        `, [commentId])

        return comment.map(this._mapCommentFull)[0]
    }

    async findCommentViewById(commentId: string, userId?: string): Promise<CommentViewSqlModel> {
        const comment = await this.dataSource.query(`
            SELECT pc."Id", pc."UserId", pc."Content", pc."PostId", pc."CreatedAt", 
		            pc."BlogId", u."Login" as "UserLogin",
		        (
		        	SELECT COUNT(*) as "LikesCount" FROM "PostCommentLike"
		        	WHERE "LikeStatus" = 'Like' AND "CommentId" = pc."Id"
		        ),
		        (
		        	SELECT COUNT(*) as "DislikesCount" FROM "PostCommentLike"
		        	WHERE "LikeStatus" = 'Dislike' AND "CommentId" = pc."Id"
		        )
                ${userId ?
                `,(
                            SELECT "LikeStatus" as "MyStatus"
                            FROM "PostCommentLike"
                            WHERE "UserId" = '${userId}' AND "PostId" = pc."PostId"
                        )`
                : ''
            }
	        FROM public."PostComments" as pc
	        LEFT JOIN "Users" as u ON pc."UserId" = u."Id"
            WHERE pc."Id" = $1;
        `, [commentId])

        return comment.map(this._mapCommentView)[0]
    }

    async findCommentsViewByPostId(queryParam: CommentQueryParam, postId: string, userId?: string) {

        let {
            sortBy = QUERY_PARAM_SQL.SORT_BY,
            sortDirection = QUERY_PARAM_SQL.SORT_DIRECTION_DESC,
            pageNumber = QUERY_PARAM_SQL.PAGE_NUMBER,
            pageSize = QUERY_PARAM_SQL.PAGE_SIZE
        } = queryParam

        const page: number = (pageNumber - 1) * pageSize

        if (sortBy) {
            const [first, ...last] = sortBy.split('')
            sortBy = first.toUpperCase() + last.join('')
        }

        const comments = await this.dataSource.query(`
            SELECT pc."Id", pc."UserId", pc."Content", pc."PostId", pc."CreatedAt", 
                pc."BlogId", u."Login" as "UserLogin",
                (
                    SELECT COUNT(*) as "LikesCount" FROM "PostCommentLike"
                    WHERE "LikeStatus" = 'Like' AND "CommentId" = pc."Id"
                ),
                (
                    SELECT COUNT(*) as "DislikesCount" FROM "PostCommentLike"
                    WHERE "LikeStatus" = 'Dislike' AND "CommentId" = pc."Id"
                )
                ${userId ?
                `,(
                        SELECT "LikeStatus" as "MyStatus"
                        FROM "PostCommentLike"
                        WHERE "UserId" = '${userId}' AND "PostId" = pc."PostId"
                    )`
                : ''
            }
            FROM public."PostComments" as pc
            LEFT JOIN "Users" as u ON pc."UserId" = u."Id"
            WHERE pc."PostId" = $3
            ORDER BY "${sortBy}" ${sortBy === 'CreatedAt' ? '' : 'COLLATE "C"'} ${sortDirection} 
            OFFSET $1 LIMIT $2;
        `, [page, pageSize, postId])

        const totalCount = await this.dataSource.query(`
            SELECT COUNT(*) FROM "PostComments"
            WHERE "PostId" = $1
        `, [postId])

        return {
            pagesCount: Math.ceil(totalCount[0].count / pageSize),
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount[0].count,
            items: comments.map(this._mapCommentView)
        }
    }

    async findLikeCommentById(commentId: string, userId: string): Promise<CommentLikeViewSqlModel> {
        const like = await this.dataSource.query(`
            SELECT "Id", "UserId", "LikeStatus", "PostId", "CommentId"
            FROM public."PostCommentLike"
            WHERE "UserId" = $1 AND "CommentId" = $2;
        `, [userId, commentId])

        return like.map(this._mapCommentLikeView)[0]
    }

    private _mapCommentFull(comment): CommentFullSqlModel {
        return {
            id: comment.Id,
            userId: comment.UserId,
            content: comment.Content,
            postId: comment.PostId,
            createdAd: comment.CreatedAt,
            blogId: comment.BlogId
        }
    }

    private _mapCommentLikeView(comment): CommentLikeViewSqlModel {
        return {
            id: comment.Id,
            userId: comment.UserId,
            likeStatus: comment.LikeStatus,
            postId: comment.PostId,
            commentId: comment.CommentId
        }
    }

    private _mapCommentView(comment): CommentViewSqlModel {
        return {
            id: comment.Id,
            content: comment.Content,
            commentatorInfo: {
                userId: comment.UserId,
                userLogin: comment.UserLogin
            },
            createdAt: comment.CreatedAt,
            likesInfo: {
                likesCount: +comment.LikesCount,
                dislikesCount: +comment.DislikesCount,
                myStatus: comment.MyStatus ?? "None"
            }
        }
    }
}