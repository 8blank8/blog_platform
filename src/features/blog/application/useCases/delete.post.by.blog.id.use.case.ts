import { CommandHandler } from '@nestjs/cqrs';
import { PostRepositoryTypeorm } from '@post/repository/typeorm/post.repository.typeorm';
import { PostQueryRepositoryTypeorm } from '@post/repository/typeorm/post.query.repository.typeorm';
import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';

export class DeletePostByBlogIdCommand {
  constructor(public postId: string, public blogId: string) {}
}

@CommandHandler(DeletePostByBlogIdCommand)
export class DeletePostByBlogIdUseCase {
  constructor(
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
    private postRepository: PostRepositoryTypeorm,
    private postQueryrepository: PostQueryRepositoryTypeorm,
  ) {}

  async execute(command: DeletePostByBlogIdCommand): Promise<boolean> {
    const { postId, blogId } = command;

    const blog = await this.blogQueryRepository.findBlogViewById(blogId);
    const post = await this.postQueryrepository.findFullPostById(postId);
    if (!blog || !post) return false;

    await this.postRepository.deletePostById(post.id);
    return true;
  }
}
