import {
  Body,
  Controller,
  Param,
  Put,
  UseGuards,
  Request,
  Res,
  Delete,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '@app/features/auth/guards/jwt.guard';
import { JwtOrNotGuard } from '@app/features/auth/guards/jwt.or.not.guard';
import { STATUS_CODE } from '@app/utils/enum/status.code';

import { CommentLikeStatusType } from '../models/comment.like.status';
import { CommentCreateType } from '../models/comment.create.type';
import { UpdateCommetCommand } from '../appication/useCases/update.comment.use.case';
import { DeleteCommentCommand } from '../appication/useCases/delete.comment.use.case';
import { UpdateLikeStatusCommentCommand } from '../appication/useCases/update.like.status.comment.use.case';
import { CommentQueryRepositoryTypeorm } from '../infrastructure/typeorm/comment.query.repository.typeorm';

@Controller('/comments')
export class CommentController {
  constructor(
    private commentQueryRepository: CommentQueryRepositoryTypeorm,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(JwtOrNotGuard)
  @Get('/:id')
  async findCommentById(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const comment = await this.commentQueryRepository.findCommentViewById(
      id,
      req.user,
    );
    if (!comment) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.status(STATUS_CODE.OK).send(comment);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async updateComment(
    @Param('id') id: string,
    @Body() inputData: CommentCreateType,
    @Request() req,
    @Res() res: Response,
  ) {
    const isUpdate = await this.commandBus.execute(
      new UpdateCommetCommand(inputData, id, req.user),
    );
    if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteComment(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const isDelete = await this.commandBus.execute(
      new DeleteCommentCommand(id, req.user),
    );
    if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id/like-status')
  async updateLikeStatus(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() inputData: CommentLikeStatusType,
    @Request() req,
  ) {
    const isUpdate = await this.commandBus.execute(
      new UpdateLikeStatusCommentCommand(id, inputData, req.user),
    );
    if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }
}
