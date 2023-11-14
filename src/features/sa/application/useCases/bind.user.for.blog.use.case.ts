import { BlogQueryRepositorySql } from '@blog/repository/sql/blog.query.repository.sql';
import { BlogRepositorySql } from '@blog/repository/sql/blog.repository.sql';
import { CommandHandler } from '@nestjs/cqrs';
import { UserQueryRepositorySql } from '@user/repository/sql/user.query.repository.sql';

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
