import { CommandHandler } from "@nestjs/cqrs";
import { CommentLikeStatusType } from "../../models/comment.like.status";
import { CommentQueryRepositoryTypeorm } from "../../infrastructure/typeorm/comment.query.repository.typeorm";
import { CommentRepositoryTypeorm } from "../../infrastructure/typeorm/comment.repository.typeorm";
import { UserQueryRepositoryTypeorm } from "../../../../features/user/infrastructure/typeorm/user.query.repository.typeorm";
import { PostCommentLike } from "../../domain/typeorm/comment.like.entity";

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
        private commentQueryRepository: CommentQueryRepositoryTypeorm,
        private commentRepository: CommentRepositoryTypeorm,
        private userQueryRepository: UserQueryRepositoryTypeorm
    ) { }

    async execute(command: UpdateLikeStatusCommentCommand): Promise<boolean> {

        const { id, inputData, userId } = command

        const comment = await this.commentQueryRepository.findCommentEntityById(id)
        if (!comment) return false

        const user = await this.userQueryRepository.findUserByIdForSa(userId)
        if (!user) return false

        const like = await this.commentQueryRepository.findLikeCommentById(id, user.id)

        if (inputData.likeStatus === like?.likeStatus) return true

        if (!like) {
            const createdLike = new PostCommentLike()
            createdLike.likeStatus = inputData.likeStatus
            createdLike.comment = comment
            createdLike.user = user

            await this.commentRepository.saveCommentLike(createdLike)

            return true
        } else {
            like.likeStatus = inputData.likeStatus
            await this.commentRepository.saveCommentLike(like)
        }

        return true
    }
}