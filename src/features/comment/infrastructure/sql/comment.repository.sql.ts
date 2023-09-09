import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentCreateSqlModel } from "./models/comment.create.sql.model";
import { CommentCreateLikeSqlModel } from "./models/comment.create.like.sql.model";


@Injectable()
export class CommentRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createComment(inputData: CommentCreateSqlModel): Promise<string> {
        const { userId, content, postId, blogId } = inputData

        const comment = await this.dataSource.query(`
            INSERT INTO public."PostComments"(
                "UserId", "Content", "PostId", "BlogId")
            VALUES ( $1, $2, $3, $4) RETURNING "Id";
        `, [userId, content, postId, blogId])

        return comment[0].Id
    }

    async updateCommentById(commentId: string, content: string) {
        await this.dataSource.query(`
            UPDATE public."PostComments"
                SET "Content" = $1
            WHERE "Id" = $2;
        `, [content, commentId])

        return true
    }

    async deleteComementById(commentId: string) {
        await this.dataSource.query(`
            DELETE FROM public."PostComments"
            WHERE "Id" = $1;
        `, [commentId])

        return true
    }

    async createCommentLike(inputData: CommentCreateLikeSqlModel): Promise<string> {

        const { userId, likeStatus, commentId, postId } = inputData

        const commentLikeId = await this.dataSource.query(`
            INSERT INTO public."PostCommentLike"(
                "UserId", "LikeStatus", "CommentId", "PostId")
            VALUES ($1, $2, $3, $4) RETURNING "Id";
        `, [userId, likeStatus, commentId, postId])

        return commentLikeId[0].Id
    }

    async updateCommentLike(likeStatus: string, userId: string, commentId: string) {
        await this.dataSource.query(`
            UPDATE public."PostCommentLike"
                SET "LikeStatus" = $1
            WHERE "UserId" = $2 AND "CommentId" = $3;
        `, [likeStatus, userId, commentId])

        return true
    }
}