import { CommandHandler } from "@nestjs/cqrs";
import { PostLikeStatusType } from "../../models/post.like.status.type";
import { PostQueryRepository } from "../../infrastructure/mongo/post.query.repository";
import { UserQueryRepository } from "../../../user/infrastructure/mongo/user.query.repository";
import { PostRepository } from "../../infrastructure/mongo/post.repository";
import { PostQueryRepositorySql } from "../../infrastructure/sql/post.query.repository.sql";
import { UserQueryRepositorySql } from "../../../user/infrastructure/sql/user.query.repository.sql";
import { PostRepositorySql } from "../../infrastructure/sql/post.repository.sql";
import { PostQueryRepositoryTypeorm } from "../../infrastructure/typeorm/post.query.repository.typeorm";
import { UserQueryRepositoryTypeorm } from "../../../../features/user/infrastructure/typeorm/user.query.repository.typeorm";
import { PostRepositoryTypeorm } from "../../infrastructure/typeorm/post.repository.typeorm";
import { PostLikes } from "../../domain/typeorm/post.like.entity";


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
        // private postQueryRepository: PostQueryRepository,
        // private postRepository: PostRepository,
        // private userQueryRepository: UserQueryRepository,
        private postQueryRepository: PostQueryRepositoryTypeorm,
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private postRepository: PostRepositoryTypeorm

    ) { }

    async execute(command: UpdateLikeStatusForPostCommand): Promise<boolean> {

        const { id, inputData, userId } = command

        // const post = await this.postQueryRepository.findPost(id)
        const post = await this.postQueryRepository.findFullPostById(id)
        if (!post) return false

        // const user = await this.userQueryRepository.findUserDocumentById(userId)
        const user = await this.userQueryRepository.findUserByIdForSa(userId)
        if (!user) return false

        // const like = await this.postQueryRepository.findPostLikeStatus(id, user.id)
        const likeStatus = await this.postQueryRepository.findLikeStatusPost(userId, id)

        if (inputData.likeStatus === likeStatus?.likeStatus) return true

        if (!likeStatus) {
            // like.updateLikeStatus(inputData.likeStatus)
            // await this.postRepository.savePostLike(like)

            // return true

            const createdLike = new PostLikes()
            createdLike.likeStatus = inputData.likeStatus
            createdLike.user = user
            createdLike.post = post

            await this.postRepository.savePostLike(createdLike)
            return true
            // await this.postRepositorySql.createLikeStatus(userId, id, inputData.likeStatus)
            // return true
        } else {
            likeStatus.likeStatus = inputData.likeStatus
            await this.postRepository.savePostLike(likeStatus)
        }

        // await this.postRepositorySql.updateLikeStatus(userId, id, inputData.likeStatus)

        // const newLike = await this.postRepository.createPostLike(inputData)
        // newLike.addId()
        // newLike.addPostId(id)
        // newLike.addUserId(user.id)
        // newLike.addAddedAt()
        // newLike.addUserLogin(user.login)

        // await this.postRepository.savePostLike(newLike)

        return true
    }
}