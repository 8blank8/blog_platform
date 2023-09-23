import { CommandHandler } from "@nestjs/cqrs";
import { CommentLikeStatusType } from "../../models/comment.like.status";
// import { CommentQueryRepository } from "../../infrastructure/mongo/comment.query.repository";
// import { CommentRepository } from "../../infrastructure/mongo/comment.repository";
// import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { CommentQueryRepositorySql } from "../../infrastructure/sql/comment.query.repository";
import { CommentRepositorySql } from "../../infrastructure/sql/comment.repository.sql";
import { UserQueryRepositorySql } from "../../../user/infrastructure/sql/user.query.repository.sql";
import { CommentCreateLikeSqlModel } from "../../infrastructure/sql/models/comment.create.like.sql.model";
import { CommentQueryRepositoryTypeorm } from "../../infrastructure/typeorm/comment.query.repository.typeorm";
import { CommentRepositoryTypeorm } from "../../infrastructure/typeorm/comment.repository.typeorm";
import { UserQueryRepositoryTypeorm } from "src/features/user/infrastructure/typeorm/user.query.repository.typeorm";
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
        // private commentQueryRepository: CommentQueryRepository,
        // private commentRepository: CommentRepository,
        // private userQueryRepository: UserQueryRepository
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
        // const createdComentLike: CommentCreateLikeSqlModel = {
        //     userId: user.id,
        //     likeStatus: inputData.likeStatus,
        //     commentId: comment.id,
        //     postId: comment.postId
        // }


        if (!like) {
            // await this.commentRepositorySql.createCommentLike(createdComentLike)
            // return true

            const createdLike = new PostCommentLike()
            createdLike.likeStatus = inputData.likeStatus
            createdLike.comment = comment
            createdLike.user = user

            await this.commentRepository.saveCommentLike(createdLike)
            // like.updateLikeStatus(inputData.likeStatus)
            // await this.commentRepository.saveCommentLike(like)

            return true
        } else {
            like.likeStatus = inputData.likeStatus
            await this.commentRepository.saveCommentLike(like)
        }

        // await this.commentRepositorySql.updateCommentLike(inputData.likeStatus, user.id, comment.id)

        // const newLike = await this.commentRepository.createCommentLike(inputData)
        // newLike.addCommentId(id)
        // newLike.addUserId(user.id)
        // newLike.addId()
        // newLike.addAddedAt()
        // newLike.addUserLogin(user.login)

        // await this.commentRepository.saveCommentLike(newLike)

        return true
    }
}