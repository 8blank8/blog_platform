import { CommandHandler } from '@nestjs/cqrs';
import { PostQueryRepositoryTypeorm } from '@post/repository/typeorm/post.query.repository.typeorm';
import { PostRepositoryTypeorm } from '@post/repository/typeorm/post.repository.typeorm';
import { PostUpdateByIdModel } from '@blog/models/post.update.by.id';
import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';
import { ForbiddenException } from '@nestjs/common';

export class UpdatePostByBlogIdCommand {
  constructor(
    public postId: string,
    public blogId: string,
    public inputData: PostUpdateByIdModel,
    public userId: string
  ) { }
}

@CommandHandler(UpdatePostByBlogIdCommand)
export class UpdatePostByBlogIdUseCase {
  constructor(
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
    private postQueryRepository: PostQueryRepositoryTypeorm,
    private postRepository: PostRepositoryTypeorm,
  ) { }

  async execute(command: UpdatePostByBlogIdCommand): Promise<boolean> {
    const { postId, blogId, inputData, userId } = command;

    const blog = await this.blogQueryRepository.findFullBlogById(blogId);
    const post = await this.postQueryRepository.findFullPostById(postId);
    if (!blog || !post) return false;
    if (blog.user.id !== userId) throw new ForbiddenException()

    post.title = inputData.title;
    post.content = inputData.content;
    post.shortDescription = inputData.shortDescription;

    await this.postRepository.savePost(post);

    return true;
  }
}
