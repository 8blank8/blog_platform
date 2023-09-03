import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { BlogCreateSqlModel } from "./models/blog.create.sql.model";
import { BlogUpdateSqlModel } from "./models/blog.update.sql.model";
import { BannedBlogCreateSqlModel } from "./models/banned.blog.create.sql.model";


@Injectable()
export class BlogRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createBlog(blog: BlogCreateSqlModel) {
        const { name, description, websiteUrl, userId } = blog

        const blogId = await this.dataSource.query(`
            INSERT INTO public."Blogs"(
                "Name", "Description", "WebsiteUrl", "UserId")
            VALUES ($1, $2, $3, $4) RETURNING "Id";
        `, [name, description, websiteUrl, userId])

        return blogId[0].Id
    }

    async updateBlogById(updateData: BlogUpdateSqlModel) {

        const { blogId, name, websiteUrl, description } = updateData

        await this.dataSource.query(`
            UPDATE public."Blogs"
	        SET "Name"= $2, "Description"= $3, "WebsiteUrl"= $4
	        WHERE "Id" = $1;
        `, [blogId, name, description, websiteUrl])

        return true
    }

    async deleteBlogById(blogId: string) {
        await this.dataSource.query(`
            DELETE FROM public."Blogs"
            WHERE "Id" = $1;
        `, [blogId])

        return true
    }

    async bindBlogForUser(userId: string, blogId: string) {
        await this.dataSource.query(`
            UPDATE public."Blogs"
	        SET  "UserId" = $1
	        WHERE "Id" = $2;
        `, [userId, blogId])

        return true
    }

    async createBanBlogById(inputData: BannedBlogCreateSqlModel) {

        const { isBanned, blogId } = inputData

        await this.dataSource.query(`
            INSERT INTO public."BlogsBannedSa"(
                "BlogId", "IsBanned")
            VALUES ( $1, $2);
        `, [blogId, isBanned])

        return true
    }

    async updateBanBlog(inputData: BannedBlogCreateSqlModel) {

        const { isBanned, blogId } = inputData

        await this.dataSource.query(`
            UPDATE public."BlogsBannedSa"
	        SET "IsBanned"= $1
	        WHERE "BlogId" = $2;
        `, [isBanned, blogId])

        return true
    }
}