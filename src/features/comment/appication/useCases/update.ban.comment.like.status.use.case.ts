import { CommentRepository } from '@comment/repository/mongo/comment.repository';
import { CommandHandler } from '@nestjs/cqrs';

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
