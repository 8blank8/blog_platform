import { CommandHandler } from '@nestjs/cqrs';
import { PostRepositoryTypeorm } from '@post/repository/typeorm/post.repository.typeorm';
import { PostQueryRepositoryTypeorm } from '@post/repository/typeorm/post.query.repository.typeorm';
import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';
import { ForbiddenException } from '@nestjs/common';

export class DeletePostByBlogIdCommand {
  constructor(
    public postId: string,
    public blogId: string,
    public userId: string
  ) { }
}

@CommandHandler(DeletePostByBlogIdCommand)
export class DeletePostByBlogIdUseCase {
  constructor(
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
    private postRepository: PostRepositoryTypeorm,
    private postQueryrepository: PostQueryRepositoryTypeorm,
  ) { }

  async execute(command: DeletePostByBlogIdCommand): Promise<boolean> {
    const { postId, blogId, userId } = command;

    const blog = await this.blogQueryRepository.findFullBlogById(blogId);
    const post = await this.postQueryrepository.findFullPostById(postId);
    if (!blog || !post) return false;
    if (blog.user.id !== userId) throw new ForbiddenException()

    await this.postRepository.deletePostById(post.id);
    return true;
  }
}
