import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BannedUserForBlogSqlModel } from './models/banned.user.for.blog.sql.model';

@Injectable()
export class UserBanBlogQueryRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBannedUser(
    userId: string,
    blogId: string,
  ): Promise<BannedUserForBlogSqlModel> {
    const user = await this.dataSource.query(
      `
            SELECT "Id", "UserId", "BlogId", "IsBanned", "BanReason"
	        FROM public."UsersBannedBlogger"
            WHERE "UserId" = $1 AND "BlogId" = $2;
        `,
      [userId, blogId],
    );

    return user.map(this._mapBannedUser)[0];
  }

  _mapBannedUser(user): BannedUserForBlogSqlModel {
    return {
      id: user.Id,
      userId: user.UserId,
      blogId: user.BlogId,
      isBanned: user.IsBanned,
      banReason: user.BanReason,
    };
  }
}
