import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PostCreateSqlModel } from "./models/post.create.sql.model";
import { PostUpdateSqlModel } from "./models/post.update.sql.model";


@Injectable()
export class PostRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createPost(inputData: PostCreateSqlModel) {

        const { title, shortDescription, content, blogId, userId } = inputData

        const postId = await this.dataSource.query(`
            INSERT INTO public."Posts"(
            "Title", "ShortDescription", "Content", "BlogId", "UserId")
            VALUES ($1, $2, $3, $4, $5) RETURNING "Id";
        `, [title, shortDescription, content, blogId, userId])

        return postId[0].Id
    }

    async updatePostById(inputData: PostUpdateSqlModel) {

        const { title, shortDescription, content, blogId, postId } = inputData

        await this.dataSource.query(`
            UPDATE public."Posts"
	        SET "Title"= $3, "ShortDescription"= $4, "Content"= $5
	        WHERE "Id" = $1 AND "BlogId" = $2;
        `, [postId, blogId, title, shortDescription, content])

        return true
    }

    async deletePostById(postId: string) {
        await this.dataSource.query(`
            DELETE FROM public."Posts"
	        HERE "Id" = $1;
        `, [postId])

        return true
    }
}