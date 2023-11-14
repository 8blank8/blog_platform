import { CommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../../infrastructure/mongo/comment.repository';

export class UpdateBanCommentLikeStatusCommand {
  constructor(public isBanned: boolean, public userId: string) {}
}

@CommandHandler(UpdateBanCommentLikeStatusCommand)
export class UpdateBanCommentLikeStatusUseCase {
  constructor(private commentRepository: CommentRepository) {}

  async execute(command: UpdateBanCommentLikeStatusCommand) {
    const { isBanned, userId } = command;

    return await this.commentRepository.updateBanStatusCommentsLikeStatus(
      userId,
      isBanned,
    );
  }
}
