import { CommandHandler } from '@nestjs/cqrs';

import { PostUpdateByIdModel } from '../../models/post.update.by.id';
import { BlogQueryRepositoryTypeorm } from '../../infrastructure/typeorm/blog.query.repository.typeorm';
import { PostQueryRepositoryTypeorm } from '../../../../features/post/infrastructure/typeorm/post.query.repository.typeorm';
import { PostRepositoryTypeorm } from '../../../../features/post/infrastructure/typeorm/post.repository.typeorm';

export class UpdatePostByBlogIdCommand {
  constructor(
    public postId: string,
    public blogId: string,
    public inputData: PostUpdateByIdModel,
  ) {}
}

@CommandHandler(UpdatePostByBlogIdCommand)
export class UpdatePostByBlogIdUseCase {
  constructor(
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
    private postQueryRepository: PostQueryRepositoryTypeorm,
    private postRepository: PostRepositoryTypeorm,
  ) {}

  async execute(command: UpdatePostByBlogIdCommand): Promise<boolean> {
    const { postId, blogId, inputData } = command;

    const blog = await this.blogQueryRepository.findBlogViewById(blogId);
    const post = await this.postQueryRepository.findFullPostById(postId);
    if (!blog || !post) return false;

    post.title = inputData.title;
    post.content = inputData.content;
    post.shortDescription = inputData.shortDescription;

    await this.postRepository.savePost(post);

    return true;
  }
}
