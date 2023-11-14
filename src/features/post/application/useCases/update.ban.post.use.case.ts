import { CommandHandler } from '@nestjs/cqrs';

import { PostRepository } from '../../infrastructure/mongo/post.repository';

export class UpdateBanPostCommand {
  constructor(public isBanned: boolean, public userId: string) {}
}

@CommandHandler(UpdateBanPostCommand)
export class UpdateBanPostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(command: UpdateBanPostCommand) {
    const { isBanned, userId } = command;

    return this.postRepository.updateBanStatusPosts(userId, isBanned);
  }
}
