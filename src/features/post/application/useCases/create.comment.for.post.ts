import { UserBlogBanQueryRepositoryTypeorm } from '@blog/repository/typeorm/user.ban.blog.query.repository';
import { PostComments } from '@comment/domain/typeorm/comment.entitty';
import { CommentCreateType } from '@comment/models/comment.create.type';
import { CommentRepositoryTypeorm } from '@comment/repository/typeorm/comment.repository.typeorm';
import { ForbiddenException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { PostQueryRepositoryTypeorm } from '@post/repository/typeorm/post.query.repository.typeorm';
import { UserQueryRepositoryTypeorm } from '@user/repository/typeorm/user.query.repository.typeorm';

export class CreateCommentForPostCommand {
  constructor(
    public id: string,
    public inputData: CommentCreateType,
    public userId: string,
  ) { }
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase {
  constructor(
    private postQueryRepository: PostQueryRepositoryTypeorm,
    private userQueryRepository: UserQueryRepositoryTypeorm,
    private commentRepository: CommentRepositoryTypeorm,
    private userBanBlogQueryRepository: UserBlogBanQueryRepositoryTypeorm
  ) { }

  async execute(
    command: CreateCommentForPostCommand,
  ): Promise<boolean | string> {
    const { id, inputData, userId } = command;

    const post = await this.postQueryRepository.findFullPostById(id);
    if (!post) return false;

    const user = await this.userQueryRepository.findUserByIdForSa(userId);
    if (!user) return false;

    const bannedUser = await this.userBanBlogQueryRepository.findBannedUserForBlog(user.id, post.blog.id)
    if (bannedUser?.isBanned) throw new ForbiddenException()

    const comment = new PostComments();
    comment.content = inputData.content;
    comment.post = post;
    comment.blog = post.blog;
    comment.user = user;

    await this.commentRepository.saveComment(comment);

    return comment.id;
  }
}
