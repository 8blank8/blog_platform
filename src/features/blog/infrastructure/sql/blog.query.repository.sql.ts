import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { BlogViewSqlModel } from './models/blog.view.sql.model';
import { BlogFullSqlModel } from './models/blog.full.sql.model';
import { BlogQueryParamModel } from '../../../../features/sa/infrastructure/models/blog.query.param';
import { QUERY_PARAM_SQL } from '../../../../utils/enum/query.param.enum.sql';
import { BannedBlogViewSqlModel } from './models/banned.blog.view.sql.model';

@Injectable()
export class BlogQueryRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAllBlogsView(queryParam: BlogQueryParamModel) {
    let {
      searchNameTerm = QUERY_PARAM_SQL.SEARCH_NAME_TERM,
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

    const blogs = await this.dataSource.query(
      `
            SELECT "Id", "Name", "Description", "WebsiteUrl", "CreatedAt", "IsMembership"
            FROM public."Blogs"
            WHERE "Name" ILIKE $1
	        ORDER BY "${sortBy}" ${
        sortBy !== 'CreatedAt' ? 'COLLATE "C"' : ''
      } ${sortDirection}
	        OFFSET $2 LIMIT $3;
        `,
      [`%${searchNameTerm}%`, page, pageSize],
    );

    const totalCount = await this.dataSource.query(
      `
            SELECT COUNT(*) FROM "Blogs"
            WHERE "Name" ILIKE $1;
        `,
      [`%${searchNameTerm}%`],
    );

    return {
      pagesCount: Math.ceil(totalCount[0].count / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount[0].count,
      items: blogs.map(this._mapBlogView),
    };
  }

  async findBlogViewById(blogId: string) {
    const blog = await this.dataSource.query(
      `
            SELECT "Id", "Name", "Description", "WebsiteUrl", "CreatedAt", "IsMembership"
            FROM public."Blogs"
            WHERE "Id" = $1;
        `,
      [blogId],
    );

    return blog.map(this._mapBlogView)[0];
  }

  async findBlogFullById(blogId: string): Promise<BlogFullSqlModel | null> {
    const blog = await this.dataSource.query(
      `
            SELECT "Id", "Name", "Description", "WebsiteUrl", "CreatedAt", "IsMembership", "UserId"
            FROM public."Blogs"
            WHERE "Id" = $1;
        `,
      [blogId],
    );

    if (!blog[0]) return null;

    return blog.map(this._mapBlogFull)[0];
  }

  async findBannedBlogById(blogId: string): Promise<BannedBlogViewSqlModel> {
    const blog = await this.dataSource.query(
      `
            SELECT "Id", "BlogId", "IsBanned"
	        FROM public."BlogsBannedSa"
            WHERE "BlogId" = $1;
        `,
      [blogId],
    );

    return blog.map(this._mapBannedBlog)[0];
  }

  _mapBannedBlog(blog): BannedBlogViewSqlModel {
    return {
      id: blog.Id,
      blogId: blog.BlogId,
      isBanned: blog.IsBanned,
    };
  }

  _mapBlogFull(blog): BlogFullSqlModel {
    return {
      id: blog.Id,
      name: blog.Name,
      description: blog.Description,
      websiteUrl: blog.WebsiteUrl,
      createdAt: blog.CreatedAt,
      isMembership: blog.IsMembership,
      userId: blog.UserId,
    };
  }

  _mapBlogView(blog): BlogViewSqlModel {
    return {
      id: blog.Id,
      name: blog.Name,
      description: blog.Description,
      websiteUrl: blog.WebsiteUrl,
      createdAt: blog.CreatedAt,
      isMembership: blog.IsMembership,
    };
  }
}
