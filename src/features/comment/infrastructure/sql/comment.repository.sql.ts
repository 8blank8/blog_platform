import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CommentCreateSqlModel } from "./models/comment.create.sql.model";


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
}