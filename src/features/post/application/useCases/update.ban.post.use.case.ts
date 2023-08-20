import { CommandHandler } from "@nestjs/cqrs";
import { PostQueryRepository } from "../../infrastructure/post.query.repository";
import { PostRepository } from "../../infrastructure/post.repository";


export class UpdateBanPostCommand {
    constructor(
        public isBanned: boolean,
        public userId: string
    ) { }
}

@CommandHandler(UpdateBanPostCommand)
export class UpdateBanPostUseCase {
    constructor(
        private postRepository: PostRepository
    ) { }

    async execute(command: UpdateBanPostCommand) {

        const { isBanned, userId } = command

        return await this.postRepository.updateBanStatusPosts(userId, isBanned)
    }
}