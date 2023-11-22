import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { BanUserForBlogModel } from '@blog/models/ban.user.for.blog.model';
import { BannedUserForBlogCreateSqlModel } from '@blog/models/banned.user.for.blog.create.sql.model';
import { UserQueryRepositoryTypeorm } from '@user/repository/typeorm/user.query.repository.typeorm';
import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';
import { UserBlogBanRepositoryTypeorm } from '@blog/repository/typeorm/user.ban.blog.repository';
import { UserBlogBanQueryRepositoryTypeorm } from '@blog/repository/typeorm/user.ban.blog.query.repository';
import { BlogBanUser } from '@blog/domain/typeorm/blog.ban.user.entity';

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
    private userQueryRepository: UserQueryRepositoryTypeorm,
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
    private userBanBlogQueryRepository: UserBlogBanQueryRepositoryTypeorm,
    private userBanBlogRepository: UserBlogBanRepositoryTypeorm,
  ) { }

  async execute(command: BanUserForBlogCommand): Promise<boolean> {
    const { inputData, bannedUserId, blogUserId } = command;

    const user = await this.userQueryRepository.findUserByIdForSa(bannedUserId);
    if (!user) return false;

    const blog = await this.blogQueryRepository.findFullBlogById(
      inputData.blogId,
    );
    if (!blog) return false;
    if (blog.user.id !== blogUserId) throw new ForbiddenException();

    let bannedUser = await this.userBanBlogQueryRepository.findBannedUserForBlog(
      user.id,
      blog.id,
    );

    if (!bannedUser) {
      bannedUser = new BlogBanUser()
    }

    bannedUser.banDate = inputData.isBanned ? new Date().toISOString() : null
    bannedUser.banReason = inputData.isBanned ? inputData.banReason : null
    bannedUser.blog = blog
    bannedUser.isBanned = inputData.isBanned
    bannedUser.user = user

    await this.userBanBlogRepository.saveBlogBan(bannedUser)

    return true
  }
}
