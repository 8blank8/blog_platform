import { CommandHandler } from '@nestjs/cqrs';
import { BlogQueryRepositorySql } from '@blog/repository/sql/blog.query.repository.sql';
import { BlogRepositorySql } from '@blog/repository/sql/blog.repository.sql';
import { BannedBlogCreateSqlModel } from '@blog/models/banned.blog.create.sql.model';

import { BlogBanInputDataModel } from '../../models/blog.ban.input.data.model';

export class BlogBanCommand {
  constructor(public blogId: string, public inputData: BlogBanInputDataModel) {}
}

@CommandHandler(BlogBanCommand)
export class BlogBanUseCase {
  constructor(
    private blogQueryRepositorySql: BlogQueryRepositorySql,
    private blogRepositorySql: BlogRepositorySql,
  ) {}

  async execute(command: BlogBanCommand) {
    const { inputData, blogId } = command;

    const blog = await this.blogQueryRepositorySql.findBlogFullById(blogId);
    if (!blog) return false;

    const bannedBlog = await this.blogQueryRepositorySql.findBannedBlogById(
      blogId,
    );

    const updateBlog: BannedBlogCreateSqlModel = {
      blogId: blog.id,
      isBanned: inputData.isBanned,
    };

    if (!bannedBlog) {
      await this.blogRepositorySql.createBanBlogById(updateBlog);
      return true;
    }

    await this.blogRepositorySql.updateBanBlog(updateBlog);

    return true;
  }
}
