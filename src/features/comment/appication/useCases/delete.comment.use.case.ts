import { CommandHandler } from "@nestjs/cqrs";
import { CommentQueryRepository } from "../../infrastructure/mongo/comment.query.repository";
import { CommentRepository } from "../../infrastructure/mongo/comment.repository";
import { ForbiddenException } from "@nestjs/common";
import { CommentQueryRepositorySql } from "../../infrastructure/sql/comment.query.repository";
import { CommentRepositorySql } from "../../infrastructure/sql/comment.repository.sql";

export class DeleteCommentCommand {
    constructor(
        public id: string,
        public userId: string
    ) { }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase {
    constructor(
        // private commentQueryRepository: CommentQueryRepository,
        // private commentRepository: CommentRepository,
        private commentQueryRepositorySql: CommentQueryRepositorySql,
        private commentRepositorySql: CommentRepositorySql
    ) { }

    async execute(command: DeleteCommentCommand): Promise<boolean> {
        const comment = await this.commentQueryRepositorySql.findCommentViewById(command.id)
        if (!comment) return false

        if (comment.commentatorInfo.userId !== command.userId) throw new ForbiddenException()

        const isDelete = await this.commentRepositorySql.deleteComementById(command.id)
        return isDelete
    }
}