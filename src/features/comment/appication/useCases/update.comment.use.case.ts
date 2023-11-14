import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';

import { CommentCreateType } from '../../models/comment.create.type';
import { CommentQueryRepositoryTypeorm } from '../../infrastructure/typeorm/comment.query.repository.typeorm';
import { CommentRepositoryTypeorm } from '../../infrastructure/typeorm/comment.repository.typeorm';

export class UpdateCommetCommand {
  constructor(
    public inputData: CommentCreateType,
    public commentId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UpdateCommetCommand)
export class UpdateCommentUseCase {
  constructor(
    private commentQueryRepository: CommentQueryRepositoryTypeorm,
    private commentRepository: CommentRepositoryTypeorm,
  ) {}

  async execute(command: UpdateCommetCommand): Promise<boolean> {
    const comment = await this.commentQueryRepository.findCommentEntityById(
      command.commentId,
    );
    if (!comment) return false;

    if (comment.user.id !== command.userId) throw new ForbiddenException();

    comment.content = command.inputData.content;

    await this.commentRepository.saveComment(comment);

    return true;
  }
}
