import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentViewSqlModel } from "./models/comment.view.sql.model";


@Injectable()
export class CommentQueryRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async findCommentViewById(commentId: string): Promise<CommentViewSqlModel> {
        const comment = await this.dataSource.query(`
            SELECT pc."Id", pc."UserId", pc."Content", pc."PostId", pc."CreatedAt", 
		            pc."BlogId", u."Login" as "UserLogin",
		        (
		        	SELECT COUNT(*) as "LikesCount" FROM "PostCommentLike"
		        	WHERE "LikeStatus" = 'Like'
		        ),
		        (
		        	SELECT COUNT(*) as "DislikesCount" FROM "PostCommentLike"
		        	WHERE "LikeStatus" = 'Dislike'
		        )
	        FROM public."PostComments" as pc
	        LEFT JOIN "Users" as u ON pc."UserId" = u."Id"
            WHERE pc."Id" = $1;
        `, [commentId])

        return comment.map(this._mapCommentView)
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
                myStatus: "None"
            }
        }
    }
}