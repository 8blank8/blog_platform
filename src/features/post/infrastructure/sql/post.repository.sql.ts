import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostCreateSqlModel } from './models/post.create.sql.model';
import { PostUpdateSqlModel } from './models/post.update.sql.model';

@Injectable()
export class PostRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createPost(inputData: PostCreateSqlModel) {
    const { title, shortDescription, content, blogId } = inputData;

    const postId = await this.dataSource.query(
      `
            INSERT INTO public."Posts"(
            "Title", "ShortDescription", "Content", "BlogId")
            VALUES ($1, $2, $3, $4) RETURNING "Id";
        `,
      [title, shortDescription, content, blogId],
    );

    return postId[0].Id;
  }

  async updatePostById(inputData: PostUpdateSqlModel) {
    const { title, shortDescription, content, blogId, postId } = inputData;

    await this.dataSource.query(
      `
            UPDATE public."Posts"
	        SET "Title"= $3, "ShortDescription"= $4, "Content"= $5
	        WHERE "Id" = $1 AND "BlogId" = $2;
        `,
      [postId, blogId, title, shortDescription, content],
    );

    return true;
  }

  async deletePostById(postId: string) {
    await this.dataSource.query(
      `
            DELETE FROM public."Posts"
	        WHERE "Id" = $1;
        `,
      [postId],
    );

    return true;
  }

  async deleteAllPosts() {
    await this.dataSource.query(`
            DELETE FROM "Posts";
        `);
  }

  async createLikeStatus(userId: string, postId: string, likeStatus: string) {
    await this.dataSource.query(
      `
            INSERT INTO public."PostsLike"(
                "UserId", "LikeStatus", "PostId")
            VALUES ( $1, $2, $3);
        `,
      [userId, likeStatus, postId],
    );

    return true;
  }

  async updateLikeStatus(userId: string, postId: string, likeStatus: string) {
    await this.dataSource.query(
      `
            UPDATE public."PostsLike"
            SET "LikeStatus"= $1
            WHERE "UserId" = $2 AND "PostId" = $3;
        `,
      [likeStatus, userId, postId],
    );

    return true;
  }
}
