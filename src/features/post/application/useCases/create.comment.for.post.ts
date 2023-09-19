import { CommandHandler } from "@nestjs/cqrs";
import { CommentDocument } from "../../../comment/domain/mongoose/comment.schema";
import { CommentCreateType } from "../../../../features/comment/models/comment.create.type";
import { PostQueryRepository } from "../../infrastructure/mongo/post.query.repository";
import { UserQueryRepository } from "../../../user/infrastructure/mongo/user.query.repository";
import { CommentRepository } from "../../../../features/comment/infrastructure/mongo/comment.repository";
import { UserBanBlogRepository } from "../../../../features/blog/infrastructure/mongo/user.ban.blog.repository";
import { ForbiddenException } from "@nestjs/common";
import { PostQueryRepositorySql } from "../../infrastructure/sql/post.query.repository.sql";
import { UserQueryRepositorySql } from "../../../user/infrastructure/sql/user.query.repository.sql";
import { CommentCreateSqlModel } from "../../../../features/comment/infrastructure/sql/models/comment.create.sql.model";
import { CommentRepositorySql } from "../../../../features/comment/infrastructure/sql/comment.repository.sql";
import { PostQueryRepositoryTypeorm } from "../../infrastructure/typeorm/post.query.repository.typeorm";
import { UserQueryRepositoryTypeorm } from "src/features/user/infrastructure/typeorm/user.query.repository.typeorm";
import { PostComments } from "../../../../features/comment/domain/typeorm/comment.entitty";


export class CreateCommentForPostCommand {
    constructor(
        public id: string,
        public inputData: CommentCreateType,
        public userId: string
    ) { }
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase {
    constructor(
        // private postQueryRepository: PostQueryRepository,
        // private userQueryRepository: UserQueryRepository,
        private postQueryRepository: PostQueryRepositoryTypeorm,
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private commentRepository: CommentRepositorySql,
        // private commentRepository: CommentRepository,
        private userBanBlogRepository: UserBanBlogRepository
    ) { }

    async execute(command: CreateCommentForPostCommand): Promise<boolean | string> {

        const { id, inputData, userId } = command

        const post = await this.postQueryRepository.findFullPostById(id)
        if (!post) return false

        const user = await this.userQueryRepository.findUserByIdForSa(userId)
        if (!user) return false

        // const commentDto: CommentCreateSqlModel = {
        //     userId: user.id,
        //     content: inputData.content,
        //     postId: post.id,
        //     blogId: post.blogId
        // }

        // const commentId = await this.commentRepositorySql.createComment(commentDto)

        const comment = new PostComments()
        comment.content = inputData.content
        comment.post = post
        comment.blog = post.blog
        comment.user = user


        return comment.id

        // const bannedUser = await this.userBanBlogRepository.findBannedUser(user.id, post.blogId)
        // if (bannedUser?.isBanned === true) throw new ForbiddenException()

        // const comment = await this.commentRepository.createComment(inputData)
        // comment.addId()
        // comment.addCreatedAt()
        // comment.addCommentatorInfo(user)
        // comment.addPostId(post.id)
        // comment.addBlogId(post.blogId)
        // console.log(post.blogId, 'blogid for create')


        // await this.commentRepository.saveComment(comment)

        // return comment
    }
}