import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { CommentCreateType } from '@app/features/comment/models/comment.create.type';
import { JwtAuthGuard } from '@app/features/auth/guards/jwt.guard';
import { CommentQueryParam } from '@app/features/comment/models/comment.query.param.type';
import { JwtOrNotGuard } from '@app/features/auth/guards/jwt.or.not.guard';
import { BasicAuthGuard } from '@app/features/auth/guards/basic.guard';
import { STATUS_CODE } from '@app/utils/enum/status.code';
import { CommentQueryRepositoryTypeorm } from '@app/features/comment/infrastructure/typeorm/comment.query.repository.typeorm';

import { PostQueryParamType } from '../models/post.query.param.type';
import { PostUpdateType } from '../models/post.update.type';
import { PostLikeStatusType } from '../models/post.like.status.type';
import { UpdatePostCommand } from '../application/useCases/update.post.use.case';
import { DeletePostCommand } from '../application/useCases/delete.post.use.case';
import { CreateCommentForPostCommand } from '../application/useCases/create.comment.for.post';
import { UpdateLikeStatusForPostCommand } from '../application/useCases/update.like.status.for.post';
import { PostQueryRepositoryTypeorm } from '../infrastructure/typeorm/post.query.repository.typeorm';

@Controller('posts')
export class PostControler {
  constructor(
    private postQueryRepository: PostQueryRepositoryTypeorm,
    private commentQueryRepository: CommentQueryRepositoryTypeorm,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(JwtOrNotGuard)
  @Get()
  async getPosts(@Query() queryParam: PostQueryParamType, @Request() req) {
    const userId = req.user;

    const posts = await this.postQueryRepository.findPostsForPublic(
      queryParam,
      userId,
    );
    return posts;
  }

  @UseGuards(JwtOrNotGuard)
  @Get('/:id')
  async getPost(@Param('id') id: string, @Res() res: Response, @Request() req) {
    const userId = req.user;

    const post = await this.postQueryRepository.findPostByIdForPublic(
      id,
      userId,
    );
    if (!post) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.status(STATUS_CODE.OK).send(post);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:id')
  async updatePost(
    @Param('id') id: string,
    @Body() inputData: PostUpdateType,
    @Res() res: Response,
  ) {
    const isUpdate = await this.commandBus.execute(
      new UpdatePostCommand(id, inputData),
    );
    if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  async deletePost(@Param('id') id: string, @Res() res: Response) {
    const isDelete = await this.commandBus.execute(new DeletePostCommand(id));
    if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/:id/comments')
  async createCommentForPost(
    @Body() inputData: CommentCreateType,
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response,
  ) {
    const commentId = await this.commandBus.execute(
      new CreateCommentForPostCommand(id, inputData, req.user),
    );
    if (!commentId) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    const comment = await this.commentQueryRepository.findCommentViewById(
      commentId,
    );

    return res.status(STATUS_CODE.CREATED).send(comment);
  }

  @UseGuards(JwtOrNotGuard)
  @Get('/:id/comments')
  async findCommentsByPostId(
    @Param('id') id: string,
    @Query() queryParam: CommentQueryParam,
    @Request() req,
    @Res() res: Response,
  ) {
    const post = await this.postQueryRepository.findFullPostById(id);
    if (!post) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    const comments = await this.commentQueryRepository.findCommentsViewByPostId(
      queryParam,
      id,
      req.user,
    );
    return res.status(STATUS_CODE.OK).send(comments);
  }

  @UseGuards(JwtAuthGuard)
  @Put('/:id/like-status')
  async updatePostLikeStatus(
    @Param('id') id: string,
    @Body() inputData: PostLikeStatusType,
    @Request() req,
    @Res() res: Response,
  ) {
    const isUpdate = await this.commandBus.execute(
      new UpdateLikeStatusForPostCommand(id, inputData, req.user),
    );
    if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }
}
