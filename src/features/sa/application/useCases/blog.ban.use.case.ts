import { CommandHandler } from '@nestjs/cqrs';
import { BannedBlogCreateSqlModel } from '@blog/models/banned.blog.create.sql.model';

import { BlogBanInputDataModel } from '../../models/blog.ban.input.data.model';
import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';
import { BlogRepositoryTypeorm } from '@blog/repository/typeorm/blog.repository.typeorm';
import { BlogBan } from '@blog/domain/typeorm/blog.ban.entity';

export class BlogBanCommand {
  constructor(public blogId: string, public inputData: BlogBanInputDataModel) { }
}

@CommandHandler(BlogBanCommand)
export class BlogBanUseCase {
  constructor(
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
    private blogRepository: BlogRepositoryTypeorm,
  ) { }

  async execute(command: BlogBanCommand) {
    const { inputData, blogId } = command;

    const blog = await this.blogQueryRepository.findFullBlogById(blogId);
    if (!blog) return false;

    // let bannedBlog = await this.blogQueryRepository.findBannedBlogById(
    //   blogId,
    // );
    blog.banDate = inputData.isBanned ? new Date().toISOString() : null
    blog.isBanned = inputData.isBanned
    // if (!bannedBlog) {
    //   bannedBlog = new BlogBan()
    // }

    // bannedBlog.banDate = inputData.isBanned ? new Date().toISOString() : null
    // bannedBlog.isBanned = inputData.isBanned
    // bannedBlog.blog = blog

    await this.blogRepository.saveBlog(blog)

    return true;
  }
}
