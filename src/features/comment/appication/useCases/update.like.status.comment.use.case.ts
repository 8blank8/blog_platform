import { CommandHandler } from "@nestjs/cqrs";
import { CommentLikeStatusType } from "../../models/comment.like.status";
// import { CommentQueryRepository } from "../../infrastructure/mongo/comment.query.repository";
// import { CommentRepository } from "../../infrastructure/mongo/comment.repository";
// import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { CommentQueryRepositorySql } from "../../infrastructure/sql/comment.query.repository";
import { CommentRepositorySql } from "../../infrastructure/sql/comment.repository.sql";
import { UserQueryRepositorySql } from "../../../user/infrastructure/sql/user.query.repository.sql";
import { CommentCreateLikeSqlModel } from "../../infrastructure/sql/models/comment.create.like.sql.model";

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
        private commentQueryRepositorySql: CommentQueryRepositorySql,
        private commentRepositorySql: CommentRepositorySql,
        private userQueryRepositorySql: UserQueryRepositorySql
    ) { }

    async execute(command: UpdateLikeStatusCommentCommand): Promise<boolean> {

        const { id, inputData, userId } = command

        const comment = await this.commentQueryRepositorySql.findCommentFullById(id)
        if (!comment) return false

        const user = await this.userQueryRepositorySql.findUser(userId)
        if (!user) return false

        const like = await this.commentQueryRepositorySql.findLikeCommentById(id, user.id)

        if (inputData.likeStatus === like?.likeStatus) return true

        const createdComentLike: CommentCreateLikeSqlModel = {
            userId: user.id,
            likeStatus: inputData.likeStatus,
            commentId: comment.id,
            postId: comment.postId
        }

        if (!like) {
            await this.commentRepositorySql.createCommentLike(createdComentLike)
            return true
            // like.updateLikeStatus(inputData.likeStatus)
            // await this.commentRepository.saveCommentLike(like)

            // return true
        }

        await this.commentRepositorySql.updateCommentLike(inputData.likeStatus, user.id, comment.id)
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