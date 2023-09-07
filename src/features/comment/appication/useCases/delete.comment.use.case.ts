import { CommandHandler } from "@nestjs/cqrs";
import { CommentQueryRepository } from "../../infrastructure/mongo/comment.query.repository";
import { CommentRepository } from "../../infrastructure/mongo/comment.repository";
import { ForbiddenException } from "@nestjs/common";

export class DeleteCommentCommand {
    constructor(
        public id: string,
        public userId: string
    ) { }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase {
    constructor(
        private commentQueryRepository: CommentQueryRepository,
        private commentRepository: CommentRepository,
    ) { }

    async execute(command: DeleteCommentCommand): Promise<boolean> {
        const comment = await this.commentQueryRepository.findCommentById(command.id)
        if (!comment) return false

        if (comment.commentatorInfo.userId !== command.userId) throw new ForbiddenException()

        const isDelete = await this.commentRepository.deleteComment(command.id)
        return isDelete
    }
}