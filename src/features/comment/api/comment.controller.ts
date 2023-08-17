import { Body, Controller, Param, Put, UseGuards, Request, Res, Delete, Req, Get } from "@nestjs/common";
import { CommentCreateType } from "../models/comment.create.type";
import { JwtAuthGuard } from "src/features/auth/guards/jwt.guard";
import { Response } from "express";
import { CommentService } from "../appication/comment.service";
import { CommentLikeStatusType } from "../models/comment.like.status";
import { CommentQueryRepository } from "../infrastructure/comment.query.repository";
import { JwtOrNotGuard } from "src/features/auth/guards/jwt.or.not.guard";
import { STATUS_CODE } from "src/entity/enum/status.code";

@Controller('/comments')
export class CommentController {

    constructor(
        private readonly commentService: CommentService,
        private readonly commentQueryRepository: CommentQueryRepository,
    ) { }

    @UseGuards(JwtOrNotGuard)
    @Get('/:id')
    async findCommentById(
        @Param('id') id: string,
        @Request() req,
        @Res() res: Response
    ) {
        const comment = await this.commentQueryRepository.findCommentViewById(id, req.user.userId)
        if (!comment) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.status(STATUS_CODE.OK).send(comment)
    }

    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async updateComment(
        @Param('id') id: string,
        @Body() inputData: CommentCreateType,
        @Request() req,
        @Res() res: Response
    ) {
        const isUpdate = await this.commentService.updateComment(inputData, id, req.user.userId)
        if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async deleteComment(
        @Param('id') id: string,
        @Request() req,
        @Res() res: Response
    ) {
        const isDelete = await this.commentService.deleteComment(id, req.user.userId)
        if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtAuthGuard)
    @Put('/:id/like-status')
    async updateLikeStatus(
        @Res() res: Response,
        @Param('id') id: string,
        @Body() inputData: CommentLikeStatusType,
        @Request() req
    ) {
        const isUpdate = await this.commentService.updateLikeStatus(id, inputData, req.user.userId)
        if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }
}
