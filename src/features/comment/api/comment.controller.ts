import { Body, Controller, Param, Put, UseGuards, Request, Res, Delete, Req } from "@nestjs/common";
import { CommentCreateType } from "../models/comment.create.type";
import { JwtAuthGuard } from "src/features/auth/guards/jwt.guard";
import { Response } from "express";
import { CommentService } from "../appication/comment.service";
import { CommentLikeStatusType } from "../models/comment.like.status";


@Controller('/comments')
export class CommentController {

    constructor(private readonly commentService: CommentService) { }

    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async updateComment(
        @Param('id') id: string,
        @Body() inputData: CommentCreateType,
        @Request() req,
        @Res() res: Response
    ) {
        const isUpdate = await this.commentService.updateComment(inputData, id, req.user.userId)
        if (!isUpdate) return res.sendStatus(404)

        return res.sendStatus(204)
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async deleteComment(
        @Param('id') id: string,
        @Request() req,
        @Res() res: Response
    ) {
        const isDelete = await this.commentService.deleteComment(id, req.user.userId)
        if (!isDelete) return res.sendStatus(404)

        return res.sendStatus(204)
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
        if (!isUpdate) return res.sendStatus(404)

        return res.sendStatus(204)
    }
}
