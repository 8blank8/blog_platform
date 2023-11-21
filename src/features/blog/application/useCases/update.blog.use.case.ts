import { CommandHandler } from '@nestjs/cqrs';
import { BlogUpdateType } from '@blog/models/blog.update.type';
import { BlogRepositoryTypeorm } from '@blog/repository/typeorm/blog.repository.typeorm';
import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';
import { ForbiddenException } from '@nestjs/common';

export class UpdateBlogCommand {
  constructor(
    public updateData: BlogUpdateType,
    public id: string,
    public userId: string
  ) { }
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase {
  constructor(
    private blogRepository: BlogRepositoryTypeorm,
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
  ) { }

  async execute(command: UpdateBlogCommand) {
    const { updateData, id, userId } = command;

    const blog = await this.blogQueryRepository.findFullBlogById(id);
    if (!blog) return false;
    if (blog.user.id !== userId) throw new ForbiddenException()

    blog.name = updateData.name;
    blog.description = updateData.description;
    blog.websiteUrl = updateData.websiteUrl;

    await this.blogRepository.saveBlog(blog);

    return true;
  }
}
