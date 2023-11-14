import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentQueryRepositoryTypeorm } from '@comment/repository/typeorm/comment.query.repository.typeorm';
import { CommentRepositoryTypeorm } from '@comment/repository/typeorm/comment.repository.typeorm';

export class DeleteCommentCommand {
  constructor(public id: string, public userId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase {
  constructor(
    private commentQueryRepository: CommentQueryRepositoryTypeorm,
    private commentRepository: CommentRepositoryTypeorm,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const comment = await this.commentQueryRepository.findCommentEntityById(
      command.id,
    );
    if (!comment) return false;

    if (comment.user.id !== command.userId) throw new ForbiddenException();

    await this.commentRepository.deleteComementById(command.id);

    return true;
  }
}
