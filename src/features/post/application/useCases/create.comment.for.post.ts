import { CommandHandler } from '@nestjs/cqrs';
import { CommentCreateType } from '@app/features/comment/models/comment.create.type';
import { UserQueryRepositoryTypeorm } from '@app/features/user/infrastructure/typeorm/user.query.repository.typeorm';
import { PostComments } from '@app/features/comment/domain/typeorm/comment.entitty';
import { CommentRepositoryTypeorm } from '@app/features/comment/infrastructure/typeorm/comment.repository.typeorm';

import { PostQueryRepositoryTypeorm } from '../../infrastructure/typeorm/post.query.repository.typeorm';

export class CreateCommentForPostCommand {
  constructor(
    public id: string,
    public inputData: CommentCreateType,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase {
  constructor(
    private postQueryRepository: PostQueryRepositoryTypeorm,
    private userQueryRepository: UserQueryRepositoryTypeorm,
    private commentRepository: CommentRepositoryTypeorm,
  ) {}

  async execute(
    command: CreateCommentForPostCommand,
  ): Promise<boolean | string> {
    const { id, inputData, userId } = command;

    const post = await this.postQueryRepository.findFullPostById(id);
    if (!post) return false;

    const user = await this.userQueryRepository.findUserByIdForSa(userId);
    if (!user) return false;

    const comment = new PostComments();
    comment.content = inputData.content;
    comment.post = post;
    comment.blog = post.blog;
    comment.user = user;

    await this.commentRepository.saveComment(comment);

    return comment.id;
  }
}
