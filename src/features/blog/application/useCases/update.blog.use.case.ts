import { CommandHandler } from '@nestjs/cqrs';
import { BlogUpdateType } from '../../models/blog.update.type';
import { BlogRepositoryTypeorm } from '../../infrastructure/typeorm/blog.repository.typeorm';
import { BlogQueryRepositoryTypeorm } from '../../infrastructure/typeorm/blog.query.repository.typeorm';

export class UpdateBlogCommand {
  constructor(public updateData: BlogUpdateType, public id: string) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase {
  constructor(
    private blogRepository: BlogRepositoryTypeorm,
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
  ) {}

  async execute(command: UpdateBlogCommand) {
    const { updateData, id } = command;

    const blog = await this.blogQueryRepository.findBlogViewById(id);
    if (!blog) return false;

    blog.name = updateData.name;
    blog.description = updateData.description;
    blog.websiteUrl = updateData.websiteUrl;

    await this.blogRepository.saveBlog(blog);

    return true;
  }
}
