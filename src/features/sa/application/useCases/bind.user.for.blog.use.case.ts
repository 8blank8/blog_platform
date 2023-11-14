import { CommandHandler } from '@nestjs/cqrs';
import { BlogQueryRepositorySql } from '@app/features/blog/infrastructure/sql/blog.query.repository.sql';
import { BlogRepositorySql } from '@app/features/blog/infrastructure/sql/blog.repository.sql';
import { UserQueryRepositorySql } from '@app/features/user/infrastructure/sql/user.query.repository.sql';

export class BindUserForBlogCommand {
  constructor(public userId: string, public blogId: string) {}
}

@CommandHandler(BindUserForBlogCommand)
export class BindUserForBlogUseCase {
  constructor(
    private blogQueryRepositorySql: BlogQueryRepositorySql,
    private userQueryRepositorySql: UserQueryRepositorySql,
    private blogRepositorySql: BlogRepositorySql,
  ) {}

  async execute(command: BindUserForBlogCommand): Promise<boolean> {
    const { userId, blogId } = command;

    const user = await this.userQueryRepositorySql.findUserByIdForSa(userId);
    const blog = await this.blogQueryRepositorySql.findBlogFullById(blogId);
    if (!blog || !user) return false;

    await this.blogRepositorySql.bindBlogForUser(user.id, blog.id);

    return true;
  }
}
