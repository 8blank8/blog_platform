import { CommandHandler } from '@nestjs/cqrs';
import { BlogCreateType } from '@blog/models/blog.create.type';
import { Blogs } from '@blog/domain/typeorm/blog.entity';
import { BlogRepositoryTypeorm } from '@blog/repository/typeorm/blog.repository.typeorm';
import { UserQueryRepositoryTypeorm } from '@user/repository/typeorm/user.query.repository.typeorm';

export class CreateBlogCommand {
  constructor(
    public blog: BlogCreateType,
    public userId: string
  ) { }
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
  constructor(
    private blogRepository: BlogRepositoryTypeorm,
    private userQueryRepository: UserQueryRepositoryTypeorm
  ) { }

  async execute(command: CreateBlogCommand): Promise<string | boolean> {
    const { blog, userId } = command;

    const user = await this.userQueryRepository.findUserByIdForSa(userId)
    if (!user) return false

    const createdBlog = new Blogs();
    createdBlog.name = blog.name;
    createdBlog.description = blog.description;
    createdBlog.websiteUrl = blog.websiteUrl;
    createdBlog.user = user

    await this.blogRepository.saveBlog(createdBlog);
    return createdBlog.id;
  }
}
