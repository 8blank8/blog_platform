import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';
import { BlogRepositoryTypeorm } from '@blog/repository/typeorm/blog.repository.typeorm';
import { CommandHandler } from '@nestjs/cqrs';
import { UserQueryRepositoryTypeorm } from '@user/repository/typeorm/user.query.repository.typeorm';

export class BindUserForBlogCommand {
  constructor(public userId: string, public blogId: string) { }
}

@CommandHandler(BindUserForBlogCommand)
export class BindUserForBlogUseCase {
  constructor(
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
    private userQueryRepository: UserQueryRepositoryTypeorm,
    private blogRepository: BlogRepositoryTypeorm,
  ) { }

  async execute(command: BindUserForBlogCommand): Promise<boolean> {
    const { userId, blogId } = command;

    const user = await this.userQueryRepository.findUserByIdForSa(userId)
    const blog = await this.blogQueryRepository.findFullBlogById(blogId)
    if (!user || !blog) return false

    blog.user = user
    await this.blogRepository.saveBlog(blog)

    return true;
  }
}
