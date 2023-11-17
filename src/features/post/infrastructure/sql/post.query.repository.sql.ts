import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { PostFullSqlModel } from '@post/models/post.full.sql.model';
import { PostLikeStatusViewSqlModel } from '@post/models/post.like.status.view.sql.model';
import { PostQueryParamType } from '@post/models/post.query.param.type';
import { PostViewSqlModel } from '@post/models/post.view.sql.model';
import { QUERY_PARAM_SQL } from '@utils/enum/query.param.enum.sql';
import { DataSource } from 'typeorm';

@Injectable()
export class PostQueryRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findPostByBlogForBlogger(blogId: string): Promise<PostViewSqlModel[]> {
    const posts = await this.dataSource.query(
      `
            SELECT pt."Id", pt."Title", pt."ShortDescription", pt."Content", 
		            pt."BlogId", pt."UserId", pt."CreatedAt", b."Name" as "BlogName"
	        FROM public."Posts" as pt
	        LEFT JOIN "Blogs" as b ON pt."BlogId" = b."Id"
            WHERE "BlogId" = $1
        `,
      [blogId],
    );

    return posts.map(this._mapPostForBlogger);
  }

  async findPostFullById(postId: string): Promise<PostFullSqlModel> {
    const post = await this.dataSource.query(
      `
            SELECT "Id", "Title", "ShortDescription", "Content", "BlogId", "UserId", "CreatedAt"
	        FROM public."Posts"
	        WHERE "Id" = $1;
        `,
      [postId],
    );

    return post.map(this._mapPostFull)[0];
  }

  async findPostsForPublic(queryParam: PostQueryParamType, userId?: string) {
    let {
      sortBy = QUERY_PARAM_SQL.SORT_BY,
      sortDirection = QUERY_PARAM_SQL.SORT_DIRECTION_DESC,
      pageNumber = QUERY_PARAM_SQL.PAGE_NUMBER,
      pageSize = QUERY_PARAM_SQL.PAGE_SIZE,
    } = queryParam;

    const page = (+pageNumber - 1) * +pageSize;

    if (sortBy) {
      const [first, ...last] = sortBy.split('');
      sortBy = first.toUpperCase() + last.join('');
    }

    if (sortBy === 'BlogName') {
      sortBy = 'Name';
    }

    const posts = await this.dataSource.query(
      `
            SELECT ps."Id", ps."Title", ps."ShortDescription", ps."Content", 
    	        ps."BlogId", ps."UserId", ps."CreatedAt", b."Name" as "BlogName",
                (
                    SELECT COUNT(*) as "LikesCount" FROM "PostsLike"
                    WHERE "LikeStatus" = 'Like' AND "PostId" = ps."Id"
                ),
                (
                    SELECT COUNT(*) as "DislikesCount" FROM "PostsLike"
                    WHERE "LikeStatus" = 'Dislike' AND "PostId" = ps."Id"
                ),
                ARRAY(
                    SELECT json_build_object(
                        'addedAt', pl."AddedAt",
                        'userId', pl."UserId",
                        'login', (
                            SELECT u."Login" FROM "Users" as u
                            WHERE u."Id" = pl."UserId"
                                 )
                    ) FROM "PostsLike" as pl
                    WHERE ps."Id" = pl."PostId" AND pl."LikeStatus" = 'Like'
                    ORDER BY pl."AddedAt" DESC
                    LIMIT 3
                ) as "NewestLikes"
                ${
                  userId
                    ? `,(
                    SELECT "LikeStatus" as "MyStatus"
                    FROM "PostsLike"
                    WHERE "UserId" = '${userId}' AND "PostId" = ps."Id"
                )`
                    : ''
                }
            FROM public."Posts" as ps
            LEFT JOIN "Blogs" as b ON ps."BlogId" = b."Id"
            ORDER BY "${sortBy}" ${
        sortBy !== 'CreatedAt' ? 'COLLATE "C"' : ''
      } ${sortDirection}
            OFFSET $1 LIMIT $2;
        `,
      [page, pageSize],
    );

    const totalCount = await this.dataSource.query(`
                SELECT COUNT(*) FROM "Posts"
            `);

    return {
      pagesCount: Math.ceil(totalCount[0].count / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount[0].count,
      items: posts.map(this._mapPostForBlogger),
    };
  }

  async findPostsByBlogId(
    queryParam: PostQueryParamType,
    blogId: string,
    userId?: string,
  ) {
    let {
      sortBy = QUERY_PARAM_SQL.SORT_BY,
      sortDirection = QUERY_PARAM_SQL.SORT_DIRECTION_DESC,
      pageNumber = QUERY_PARAM_SQL.PAGE_NUMBER,
      pageSize = QUERY_PARAM_SQL.PAGE_SIZE,
    } = queryParam;

    const page = (+pageNumber - 1) * +pageSize;

    if (sortBy) {
      const [first, ...last] = sortBy.split('');
      sortBy = first.toUpperCase() + last.join('');
    }

    const posts = await this.dataSource.query(
      `
            SELECT ps."Id", ps."Title", ps."ShortDescription", ps."Content", 
    	        ps."BlogId", ps."UserId", ps."CreatedAt", b."Name" as "BlogName",
                (
                    SELECT COUNT(*) as "LikesCount" FROM "PostsLike"
                    WHERE "LikeStatus" = 'Like' AND "PostId" = ps."Id"
                ),
                (
                    SELECT COUNT(*) as "DislikesCount" FROM "PostsLike"
                    WHERE "LikeStatus" = 'Dislike' AND "PostId" = ps."Id"
                ),
                ARRAY(
                    SELECT json_build_object(
                        'addedAt', pl."AddedAt",
                        'userId', pl."UserId",
                        'login', (
                            SELECT u."Login" FROM "Users" as u
                            WHERE u."Id" = pl."UserId"
                                 )
                    ) FROM "PostsLike" as pl
                    WHERE ps."Id" = pl."PostId" AND pl."LikeStatus" = 'Like'
                    ORDER BY pl."AddedAt" DESC
                    LIMIT 3
                ) as "NewestLikes"
                ${
                  userId
                    ? `,(
                    SELECT "LikeStatus" as "MyStatus"
                    FROM "PostsLike"
                    WHERE "UserId" = '${userId}' AND "PostId" = ps."Id"
                )`
                    : ''
                }
            FROM public."Posts" as ps
            LEFT JOIN "Blogs" as b ON ps."BlogId" = b."Id"
            WHERE ps."BlogId" = $3
            ORDER BY "${sortBy}" ${
        sortBy !== 'CreatedAt' ? 'COLLATE "C"' : ''
      } ${sortDirection}
            OFFSET $1 LIMIT $2;
        `,
      [page, pageSize, blogId],
    );

    const totalCount = await this.dataSource.query(
      `
                SELECT COUNT(*) FROM "Posts"
                WHERE "BlogId" = $1;
            `,
      [blogId],
    );

    return {
      pagesCount: Math.ceil(totalCount[0].count / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount[0].count,
      items: posts.map(this._mapPostForBlogger),
    };
  }

  async findPostByIdForPublic(
    postId: string,
    userId?: string,
  ): Promise<PostViewSqlModel> {
    const post = await this.dataSource.query(
      `
            SELECT ps."Id", ps."Title", ps."ShortDescription", ps."Content", 
    	        ps."BlogId", ps."UserId", ps."CreatedAt", b."Name" as "BlogName",
                (
                    SELECT COUNT(*) as "LikesCount" FROM "PostsLike"
                    WHERE "LikeStatus" = 'Like' AND "PostId" = ps."Id"
                ),
                (
                    SELECT COUNT(*) as "DislikesCount" FROM "PostsLike"
                    WHERE "LikeStatus" = 'Dislike' AND "PostId" = ps."Id"
                ),
                ARRAY(
                    SELECT json_build_object(
                        'addedAt', pl."AddedAt",
                        'userId', pl."UserId",
                        'login', (
                            SELECT u."Login" FROM "Users" as u
                            WHERE u."Id" = pl."UserId"
                                 )
                    ) FROM "PostsLike" as pl
                    WHERE ps."Id" = pl."PostId" AND pl."LikeStatus" = 'Like'
                    ORDER BY pl."AddedAt" DESC
                    LIMIT 3
                ) as "NewestLikes"
                ${
                  userId
                    ? `,(
                    SELECT "LikeStatus" as "MyStatus"
                    FROM "PostsLike"
                    WHERE "UserId" = '${userId}' AND "PostId" = ps."Id"
                )`
                    : ''
                }
            FROM public."Posts" as ps
            LEFT JOIN "Blogs" as b ON ps."BlogId" = b."Id"
            WHERE ps."Id" = $1
        `,
      [postId],
    );

    return post.map(this._mapPostForBlogger)[0];
  }

  async findLikeStatusPost(
    userId: string,
    postId: string,
  ): Promise<PostLikeStatusViewSqlModel> {
    const likeStatus = await this.dataSource.query(
      `
            SELECT "Id", "UserId", "LikeStatus", "PostId", "AddedAt"
            FROM public."PostsLike"
            WHERE "UserId" = $1 AND "PostId" = $2;
        `,
      [userId, postId],
    );

    return likeStatus.map(this._mapLikeStatusPost)[0];
  }

  _mapLikeStatusPost(postLikeStatus): PostLikeStatusViewSqlModel {
    return {
      id: postLikeStatus.Id,
      userId: postLikeStatus.UserId,
      likeStatus: postLikeStatus.LikeStatus,
      postId: postLikeStatus.PostId,
      addedAt: postLikeStatus.AddedAt,
    };
  }

  _mapPostFull(post): PostFullSqlModel {
    return {
      id: post.Id,
      title: post.Title,
      shortDescription: post.ShortDescription,
      content: post.Content,
      blogId: post.BlogId,
      userId: post.UserId,
      createdAt: post.CreatedAt,
    };
  }

  _mapPostForBlogger(post): PostViewSqlModel {
    let newestLikes = [];

    if (post.NewestLikes.length !== 0) {
      newestLikes = post.NewestLikes.map((item) => {
        return {
          addedAt: new Date(item.addedAt).toISOString(),
          userId: item.userId,
          login: item.login,
        };
      });
    }

    return {
      id: post.Id,
      title: post.Title,
      shortDescription: post.ShortDescription,
      content: post.Content,
      blogId: post.BlogId,
      blogName: post.BlogName,
      createdAt: post.CreatedAt,
      extendedLikesInfo: {
        likesCount: +post.LikesCount,
        dislikesCount: +post.DislikesCount,
        myStatus: post.MyStatus ?? 'None',
        newestLikes: newestLikes,
      },
    };
  }
}
