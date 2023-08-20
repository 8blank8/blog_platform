import { CommandHandler } from "@nestjs/cqrs";
import { PostLikeStatusType } from "../../models/post.like.status.type";
import { PostQueryRepository } from "../../infrastructure/post.query.repository";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { PostRepository } from "../../infrastructure/post.repository";


export class UpdateLikeStatusForPostCommand {
    constructor(
        public id: string,
        public inputData: PostLikeStatusType,
        public userId: string
    ) { }
}

@CommandHandler(UpdateLikeStatusForPostCommand)
export class UpdateLikeStatusForPostUseCase {
    constructor(
        private postQueryRepository: PostQueryRepository,
        private postRepository: PostRepository,
        private userQueryRepository: UserQueryRepository

    ) { }

    async execute(command: UpdateLikeStatusForPostCommand): Promise<boolean> {

        const { id, inputData, userId } = command

        const post = await this.postQueryRepository.findPost(id)
        if (!post) return false

        const user = await this.userQueryRepository.findUserDocumentById(userId)
        if (!user || user.isBanned) return false

        const like = await this.postQueryRepository.findPostLikeStatus(id, user.id)

        if (inputData.likeStatus === like?.likeStatus) return true

        if (like) {
            like.updateLikeStatus(inputData.likeStatus)
            await this.postRepository.savePostLike(like)

            return true
        }

        const newLike = await this.postRepository.createPostLike(inputData)
        newLike.addId()
        newLike.addPostId(id)
        newLike.addUserId(user.id)
        newLike.addAddedAt()
        newLike.addUserLogin(user.login)

        await this.postRepository.savePostLike(newLike)

        return true
    }
}