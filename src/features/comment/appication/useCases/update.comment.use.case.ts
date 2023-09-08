import { CommandHandler } from "@nestjs/cqrs";
import { CommentCreateType } from "../../models/comment.create.type";
import { ForbiddenException } from "@nestjs/common";
import { CommentQueryRepository } from "../../infrastructure/mongo/comment.query.repository";
import { CommentRepository } from "../../infrastructure/mongo/comment.repository";
import { CommentQueryRepositorySql } from "../../infrastructure/sql/comment.query.repository";
import { CommentRepositorySql } from "../../infrastructure/sql/comment.repository.sql";


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
        private commentQueryRepositorySql: CommentQueryRepositorySql,
        private commentRepositorySql: CommentRepositorySql
        // private commentRepository: CommentRepository,
    ) { }

    async execute(command: UpdateCommetCommand): Promise<boolean> {
        const comment = await this.commentQueryRepositorySql.findCommentViewById(command.commentId)
        if (!comment) return false

        if (comment.commentatorInfo.userId !== command.userId) throw new ForbiddenException()

        await this.commentRepositorySql.updateCommentById(comment.id, command.inputData.content)
        // comment.updateContent(command.inputData.content)
        // await this.commentRepository.saveComment(comment)

        return true
    }
}