import { CommandHandler } from "@nestjs/cqrs";
import { CommentCreateType } from "../../models/comment.create.type";
import { ForbiddenException } from "@nestjs/common";
import { CommentQueryRepository } from "../../infrastructure/comment.query.repository";
import { CommentRepository } from "../../infrastructure/comment.repository";


export class UpdateCommetCommand {
    constructor(
        public inputData: CommentCreateType,
        public commentId: string,
        public userId: string
    ) { }
}

@CommandHandler(UpdateCommetCommand)
export class UpdateCommentUseCase {
    constructor(
        private commentQueryRepository: CommentQueryRepository,
        private commentRepository: CommentRepository,
    ) { }

    async execute(command: UpdateCommetCommand): Promise<boolean> {
        const comment = await this.commentQueryRepository.findCommentById(command.commentId)
        if (!comment) return false

        if (comment.commentatorInfo.userId !== command.userId) throw new ForbiddenException()

        comment.updateContent(command.inputData.content)
        await this.commentRepository.saveComment(comment)

        return true
    }
}