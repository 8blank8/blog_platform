import { CommandHandler } from '@nestjs/cqrs';
import { PostCreateByIdType } from '../../../../features/blog/models/post.create.by.id.type';
import { PostRepositoryTypeorm } from '../../infrastructure/typeorm/post.repository.typeorm';
import { BlogQueryRepositoryTypeorm } from '../../../../features/blog/infrastructure/typeorm/blog.query.repository.typeorm';
import { Posts } from '../../domain/typeorm/post.entity';

export class CreatePostByBlogIdCommand {
  constructor(
    public inputPostData: PostCreateByIdType,
    public blogId: string,
  ) {}
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase {
  constructor(
    private postRepository: PostRepositoryTypeorm,
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
  ) {}

  async execute(command: CreatePostByBlogIdCommand) {
    const { inputPostData, blogId } = command;

    const blog = await this.blogQueryRepository.findBlogViewById(blogId);
    if (!blog) return null;

    const post = new Posts();
    post.content = inputPostData.content;
    post.shortDescription = inputPostData.shortDescription;
    post.title = inputPostData.title;
    post.blog = blog;

    await this.postRepository.savePost(post);

    return post.id;
  }
}
