import { BlogQueryRepository } from '@blog/repository/mongo/blog.query.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { PostCreateType } from '@post/models/post.create.type';
import { PostRepository } from '@post/repository/mongo/post.repository';

export class CreatePostCommand {
  constructor(public inputPostData: PostCreateType) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase {
  constructor(
    private postRepository: PostRepository,
    private blogQueryRepository: BlogQueryRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<string | null> {
    const { inputPostData } = command;

    const blog = await this.blogQueryRepository.findBlogDocumentById(
      inputPostData.blogId,
    );
    if (!blog) return null;

    const newPost = await this.postRepository.createPost(inputPostData);
    newPost.addId();
    newPost.addBlogName(blog.name);
    newPost.addCreatedAt();
    newPost.setUserId(blog.userId);

    await this.postRepository.savePost(newPost);

    return newPost.id;
  }
}
