import { PostCreateByIdType } from '@blog/models/post.create.by.id.type';
import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';
import { CommandHandler } from '@nestjs/cqrs';
import { Posts } from '@post/domain/typeorm/post.entity';
import { PostRepositoryTypeorm } from '@post/repository/typeorm/post.repository.typeorm';

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
