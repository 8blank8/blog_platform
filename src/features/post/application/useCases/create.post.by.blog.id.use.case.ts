import { PostCreateByIdType } from '@blog/models/post.create.by.id.type';
import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';
import { ForbiddenException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { Posts } from '@post/domain/typeorm/post.entity';
import { PostRepositoryTypeorm } from '@post/repository/typeorm/post.repository.typeorm';
import { UserQueryRepositoryTypeorm } from '@user/repository/typeorm/user.query.repository.typeorm';

export class CreatePostByBlogIdCommand {
  constructor(
    public inputPostData: PostCreateByIdType,
    public blogId: string,
    public userId: string
  ) { }
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase {
  constructor(
    private postRepository: PostRepositoryTypeorm,
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
    private userQueryRepository: UserQueryRepositoryTypeorm
  ) { }

  async execute(command: CreatePostByBlogIdCommand) {
    const { inputPostData, blogId, userId } = command;

    const user = await this.userQueryRepository.findUserByIdForSa(userId)
    if (!user) return null

    const blog = await this.blogQueryRepository.findFullBlogById(blogId);
    if (!blog) return null;
    if (blog.user.id !== userId) throw new ForbiddenException()

    const post = new Posts();
    post.content = inputPostData.content;
    post.shortDescription = inputPostData.shortDescription;
    post.title = inputPostData.title;
    post.blog = blog;
    post.user = user

    await this.postRepository.savePost(post);

    return post.id;
  }
}
