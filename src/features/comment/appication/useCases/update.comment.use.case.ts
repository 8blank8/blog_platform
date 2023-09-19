import { CommandHandler } from "@nestjs/cqrs";
import { CommentCreateType } from "../../models/comment.create.type";
import { ForbiddenException } from "@nestjs/common";
import { CommentQueryRepository } from "../../infrastructure/mongo/comment.query.repository";
import { CommentRepository } from "../../infrastructure/mongo/comment.repository";
import { CommentQueryRepositorySql } from "../../infrastructure/sql/comment.query.repository";
import { CommentRepositorySql } from "../../infrastructure/sql/comment.repository.sql";
import { CommentQueryRepositoryTypeorm } from "../../infrastructure/typeorm/comment.query.repository.typeorm";
import { CommentRepositoryTypeorm } from "../../infrastructure/typeorm/comment.repository.typeorm";


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
        // private commentQueryRepository: CommentQueryRepository,
        private commentQueryRepository: CommentQueryRepositoryTypeorm,
        private commentRepository: CommentRepositoryTypeorm
        // private commentRepository: CommentRepository,
    ) { }

    async execute(command: UpdateCommetCommand): Promise<boolean> {
        const comment = await this.commentQueryRepository.findCommentEntityById(command.commentId)
        if (!comment) return false

        if (comment.user.id !== command.userId) throw new ForbiddenException()

        comment.content = command.inputData.content

        await this.commentRepository.saveComment(comment)
        // await this.commentRepositorySql.updateCommentById(comment.id, command.inputData.content)

        // comment.updateContent(command.inputData.content)
        // await this.commentRepository.saveComment(comment)

        return true
    }
}