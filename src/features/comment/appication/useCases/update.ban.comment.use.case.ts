import { CommandHandler } from '@nestjs/cqrs';

import { CommentRepository } from '../../infrastructure/mongo/comment.repository';

export class UpdateBanCommentCommand {
  constructor(public isBanned: boolean, public userId: string) {}
}

@CommandHandler(UpdateBanCommentCommand)
export class UpdateBanCommentUseCase {
  constructor(private commentRepository: CommentRepository) {}

  async execute(command: UpdateBanCommentCommand) {
    const { isBanned, userId } = command;

    return await this.commentRepository.updateBanStatusComments(
      userId,
      isBanned,
    );
  }
}
