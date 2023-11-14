import { CommandHandler } from '@nestjs/cqrs';

import { BlogRepositoryTypeorm } from '../../infrastructure/typeorm/blog.repository.typeorm';
import { BlogQueryRepositoryTypeorm } from '../../infrastructure/typeorm/blog.query.repository.typeorm';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase {
  constructor(
    private blogRepository: BlogRepositoryTypeorm,
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
  ) {}

  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const { id } = command;

    const blog = await this.blogQueryRepository.findBlogViewById(id);
    if (!blog) return false;

    const isDelete = await this.blogRepository.deleteBlogById(blog.id);
    if (!isDelete) return false;

    return true;
  }
}
