import { CommandHandler } from "@nestjs/cqrs";
import { CommentQueryRepository } from "../../infrastructure/mongo/comment.query.repository";
import { CommentRepository } from "../../infrastructure/mongo/comment.repository";
import { ForbiddenException } from "@nestjs/common";
import { CommentQueryRepositorySql } from "../../infrastructure/sql/comment.query.repository";
import { CommentRepositorySql } from "../../infrastructure/sql/comment.repository.sql";
import { CommentRepositoryTypeorm } from "../../infrastructure/typeorm/comment.repository.typeorm";
import { CommentQueryRepositoryTypeorm } from "../../infrastructure/typeorm/comment.query.repository.typeorm";

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
        private commentQueryRepository: CommentQueryRepositoryTypeorm,
        private commentRepository: CommentRepositoryTypeorm
    ) { }

    async execute(command: DeleteCommentCommand): Promise<boolean> {
        const comment = await this.commentQueryRepository.findCommentEntityById(command.id)
        if (!comment) return false

        if (comment.user.id !== command.userId) throw new ForbiddenException()

        await this.commentRepository.deleteComementById(command.id)

        return true
    }
}