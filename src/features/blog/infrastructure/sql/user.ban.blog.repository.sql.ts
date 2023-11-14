import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { BannedUserForBlogCreateSqlModel } from '../../models/banned.user.for.blog.create.sql.model';
import { BannedUserForBlogUpdateSqlModel } from '../../models/banned.user.for.blog.update.sql.model';

@Injectable()
export class UserBanBlogRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) { }

  async createBanUserForBlogger(inputData: BannedUserForBlogCreateSqlModel) {
    const { userId, blogId, isBanned, banReason } = inputData;

    await this.dataSource.query(
      `
            INSERT INTO public."UsersBannedBlogger"(
                "UserId", "BlogId", "IsBanned", "BanReason")
            VALUES ($1, $2, $3, $4);
        `,
      [userId, blogId, isBanned, banReason],
    );

    return true;
  }

  async updateBanStatus(inputData: BannedUserForBlogUpdateSqlModel) {
    const { userId, blogId, isBanned, banReason } = inputData;

    await this.dataSource.query(
      `
            UPDATE public."UsersBannedBlogger"
	        SET "IsBanned"= $3, "BanReason"= $4
	        WHERE "UserId" = $1 AND "BlogId" = $2;
        `,
      [userId, blogId, isBanned, banReason],
    );

    return true;
  }
}
