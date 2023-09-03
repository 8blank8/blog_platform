import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { PostViewSqlModel } from "./models/post.view.sql.model";
import { PostFullSqlModel } from "./models/post.full.sql.model";


@Injectable()
export class PostQueryRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async findPostByBlogIfForBlogger(blogId: string): Promise<PostViewSqlModel[]> {
        const posts = await this.dataSource.query(`
            SELECT pt."Id", pt."Title", pt."ShortDescription", pt."Content", 
		            pt."BlogId", pt."UserId", pt."CreatedAt", b."Name" as "BlogName"
	        FROM public."Posts" as pt
	        LEFT JOIN "Blogs" as b ON pt."BlogId" = b."Id"
            WHERE "BlogId" = $1
        `, [blogId])

        return posts.map(this._mapPostForBlogger)
    }

    async findPostFullById(postId: string): Promise<PostFullSqlModel> {
        const post = await this.dataSource.query(`
            SELECT "Id", "Title", "ShortDescription", "Content", "BlogId", "UserId", "CreatedAt"
	        FROM public."Posts"
	        WHERE "Id" = $1;
        `, [postId])

        return post.map(this._mapPostFull)[0]
    }

    // async findPostsForPublic(postId: string) {
    //     const posts = await this.dataSource.query(`
    //         SELECT ps."Id", ps."Title", ps."ShortDescription", ps."Content", 
    // 	        ps."BlogId", ps."UserId", ps."CreatedAt", ubb."IsBanned"
    //         FROM public."Posts" as ps
    //         LEFT JOIN "UsersBannedBlogger" as ubb ON ubb."BlogId" = ps."BlogId"
    //         WHERE ubb."IsBanned" is null OR ubb."IsBanned" != true
    //     `)
    // }

    _mapPostFull(post): PostFullSqlModel {
        return {
            id: post.Id,
            title: post.Title,
            shortDescription: post.ShortDescription,
            content: post.Content,
            blogId: post.BlogId,
            userId: post.UserId,
            createdAt: post.CreatedAt
        }
    }

    _mapPostForBlogger(post): PostViewSqlModel {
        return {
            id: post.Id,
            title: post.Title,
            shortDescription: post.ShortDescription,
            content: post.Content,
            blogId: post.BlogId,
            blogName: post.BlogName,
            createdAt: post.CreatedAt,
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
            }
        }
    }
}