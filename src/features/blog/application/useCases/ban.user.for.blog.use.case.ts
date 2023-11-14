import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { UserQueryRepositorySql } from '@app/features/user/infrastructure/sql/user.query.repository.sql';

import { BanUserForBlogModel } from '../../models/ban.user.for.blog.model';
import { BlogQueryRepositorySql } from '../../infrastructure/sql/blog.query.repository.sql';
import { UserBanBlogQueryRepositorySql } from '../../infrastructure/sql/user.ban.blog.query.repository.sql';
import { UserBanBlogRepositorySql } from '../../infrastructure/sql/user.ban.blog.repository.sql';
import { BannedUserForBlogCreateSqlModel } from '../../models/banned.user.for.blog.create.sql.model';

export class BanUserForBlogCommand {
  constructor(
    public inputData: BanUserForBlogModel,
    public bannedUserId: string,
    public blogUserId: string,
  ) { }
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase {
  constructor(
    private userQueryRepositorySql: UserQueryRepositorySql,
    private blogQueryRepositorySql: BlogQueryRepositorySql,
    private userBanBlogQueryRepositorySql: UserBanBlogQueryRepositorySql,
    private userBanBlogRepositorySql: UserBanBlogRepositorySql,
  ) { }

  async execute(command: BanUserForBlogCommand): Promise<boolean> {
    const { inputData, bannedUserId, blogUserId } = command;

    const user = await this.userQueryRepositorySql.findUser(bannedUserId);
    if (!user) return false;

    const blog = await this.blogQueryRepositorySql.findBlogFullById(
      inputData.blogId,
    );
    if (!blog) return false;
    if (blog.userId !== blogUserId) throw new ForbiddenException();

    const bannedUser = await this.userBanBlogQueryRepositorySql.findBannedUser(
      user.id,
      blog.id,
    );

    const updateData: BannedUserForBlogCreateSqlModel = {
      userId: user.id,
      blogId: blog.id,
      isBanned: inputData.isBanned,
      banReason: inputData.banReason,
    };

    if (!bannedUser) {
      await this.userBanBlogRepositorySql.createBanUserForBlogger(updateData);
      return true;
    }

    await this.userBanBlogRepositorySql.updateBanStatus(updateData);
    return true;
  }
}
