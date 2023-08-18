import { CommandHandler } from "@nestjs/cqrs";
import { CommentDocument } from "src/features/comment/domain/comment.schema";
import { CommentCreateType } from "src/features/comment/models/comment.create.type";
import { PostQueryRepository } from "../../infrastructure/post.query.repository";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { CommentRepository } from "src/features/comment/infrastructure/comment.repository";


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
        private commentRepository: CommentRepository
    ) { }

    async execute(command: CreateCommentForPostCommand): Promise<false | CommentDocument> {

        const { id, inputData, userId } = command

        const post = await this.postQueryRepository.findPost(id)
        if (!post) return false

        const user = await this.userQueryRepository.findUserDocumentById(userId)
        if (!user) return false

        const comment = await this.commentRepository.createComment(inputData)
        comment.addId()
        comment.addCreatedAt()
        comment.addCommentatorInfo(user)
        comment.addPostId(post.id)

        await this.commentRepository.saveComment(comment)

        return comment
    }
}