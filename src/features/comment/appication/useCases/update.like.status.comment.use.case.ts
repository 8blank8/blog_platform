import { CommandHandler } from "@nestjs/cqrs";
import { CommentLikeStatusType } from "../../models/comment.like.status";
import { CommentQueryRepository } from "../../infrastructure/comment.query.repository";
import { CommentRepository } from "../../infrastructure/comment.repository";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";

export class UpdateLikeStatusCommentCommand {
    constructor(
        public id: string,
        public inputData: CommentLikeStatusType,
        public userId: string
    ) { }
}

@CommandHandler(UpdateLikeStatusCommentCommand)
export class UpdateLikeStatusCommentUseCase {
    constructor(
        private commentQueryRepository: CommentQueryRepository,
        private commentRepository: CommentRepository,
        private userQueryRepository: UserQueryRepository
    ) { }

    async execute(command: UpdateLikeStatusCommentCommand): Promise<boolean> {

        const { id, inputData, userId } = command

        const comment = await this.commentQueryRepository.findCommentById(id)
        if (!comment) return false

        const user = await this.userQueryRepository.findUserDocumentById(userId)
        if (!user) return false

        const like = await this.commentQueryRepository.findLikeByCommentId(id, user.id)

        if (inputData.likeStatus === like?.likeStatus) return true

        if (like) {
            like.updateLikeStatus(inputData.likeStatus)
            await this.commentRepository.saveCommentLike(like)

            return true
        }

        const newLike = await this.commentRepository.createCommentLike(inputData)
        newLike.addCommentId(id)
        newLike.addUserId(user.id)
        newLike.addId()
        newLike.addAddedAt()
        newLike.addUserLogin(user.login)

        await this.commentRepository.saveCommentLike(newLike)

        return true
    }
}