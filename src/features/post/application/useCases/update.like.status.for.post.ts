import { CommandHandler } from "@nestjs/cqrs";
import { PostLikeStatusType } from "../../models/post.like.status.type";
import { PostQueryRepository } from "../../infrastructure/mongo/post.query.repository";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { PostRepository } from "../../infrastructure/mongo/post.repository";
import { PostQueryRepositorySql } from "../../infrastructure/sql/post.query.repository.sql";
import { UserQueryRepositorySql } from "src/features/user/infrastructure/user.query.repository.sql";
import { PostRepositorySql } from "../../infrastructure/sql/post.repository.sql";


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
        private postQueryRepositorySql: PostQueryRepositorySql,
        private userQueryRepositorySql: UserQueryRepositorySql,
        private postRepositorySql: PostRepositorySql

    ) { }

    async execute(command: UpdateLikeStatusForPostCommand): Promise<boolean> {

        const { id, inputData, userId } = command

        // const post = await this.postQueryRepository.findPost(id)
        const post = await this.postQueryRepositorySql.findPostFullById(id)
        if (!post) return false

        // const user = await this.userQueryRepository.findUserDocumentById(userId)
        const user = await this.userQueryRepositorySql.findUser(userId)
        if (!user) return false

        // const like = await this.postQueryRepository.findPostLikeStatus(id, user.id)
        const likeStatus = await this.postQueryRepositorySql.findLikeStatusPost(userId, id)

        if (inputData.likeStatus === likeStatus?.likeStatus) return true

        if (!likeStatus) {
            // like.updateLikeStatus(inputData.likeStatus)
            // await this.postRepository.savePostLike(like)

            // return true

            await this.postRepositorySql.createLikeStatus(userId, id, inputData.likeStatus)
            return true
        }

        await this.postRepositorySql.updateLikeStatus(userId, id, inputData.likeStatus)

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