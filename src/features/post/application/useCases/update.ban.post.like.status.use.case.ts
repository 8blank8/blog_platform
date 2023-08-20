import { CommandHandler } from "@nestjs/cqrs";
import { PostRepository } from "../../infrastructure/post.repository";


export class UpdateBanPostLikeStatusCommand {
    constructor(
        public isBanned: boolean,
        public userId: string
    ) { }
}

@CommandHandler(UpdateBanPostLikeStatusCommand)
export class UpdateBanPostLikeStatusUseCase {
    constructor(
        private postRepository: PostRepository
    ) { }

    async execute(command: UpdateBanPostLikeStatusCommand) {
        const { isBanned, userId } = command

        return await this.postRepository.updateBanStatusPostsLikeStatus(userId, isBanned)
    }
}