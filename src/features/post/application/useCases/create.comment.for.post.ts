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
        private postQueryRepositorySql: PostQueryRepositorySql,
        private userQueryRepositorySql: UserQueryRepositorySql,
        private commentRepositorySql: CommentRepositorySql,
        // private commentRepository: CommentRepository,
        private userBanBlogRepository: UserBanBlogRepository
    ) { }

    async execute(command: CreateCommentForPostCommand): Promise<boolean | string> {

        const { id, inputData, userId } = command

        const post = await this.postQueryRepositorySql.findPostFullById(id)
        if (!post) return false

        const user = await this.userQueryRepositorySql.findUser(userId)
        if (!user) return false

        const commentDto: CommentCreateSqlModel = {
            userId: user.id,
            content: inputData.content,
            postId: post.id,
            blogId: post.blogId
        }

        const commentId = await this.commentRepositorySql.createComment(commentDto)

        return commentId

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