import { CommandHandler } from "@nestjs/cqrs";
import { CommentDocument } from "src/features/comment/domain/comment.schema";
import { CommentCreateType } from "src/features/comment/models/comment.create.type";
import { PostQueryRepository } from "../../infrastructure/post.query.repository";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { CommentRepository } from "src/features/comment/infrastructure/comment.repository";
import { UserBanBlogRepository } from "src/features/blog/infrastructure/user.ban.blog.repository";
import { ForbiddenException } from "@nestjs/common";


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
        private postQueryRepository: PostQueryRepository,
        private userQueryRepository: UserQueryRepository,
        private commentRepository: CommentRepository,
        private userBanBlogRepository: UserBanBlogRepository
    ) { }

    async execute(command: CreateCommentForPostCommand): Promise<false | CommentDocument> {

        const { id, inputData, userId } = command

        const post = await this.postQueryRepository.findPost(id)
        if (!post) return false
        const user = await this.userQueryRepository.findUserDocumentById(userId)
        if (!user) return false
        const bannedUser = await this.userBanBlogRepository.findBannedUser(user.id, post.blogId)
        if (bannedUser?.isBanned === true) throw new ForbiddenException()

        const comment = await this.commentRepository.createComment(inputData)
        comment.addId()
        comment.addCreatedAt()
        comment.addCommentatorInfo(user)
        comment.addPostId(post.id)
        comment.addBlogId(post.blogId)
        console.log(post.blogId, 'blogid for create')


        await this.commentRepository.saveComment(comment)

        return comment
    }
}