import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
  Request,
  Put,
  Delete,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { JwtAuthGuard } from '@app/features/auth/guards/jwt.guard';
import { CreatePostByBlogIdCommand } from '@app/features/post/application/useCases/create.post.by.blog.id.use.case';
import { STATUS_CODE } from '@app/utils/enum/status.code';
import { PostQueryParamType } from '@app/features/post/models/post.query.param.type';
import { CommentQueryRepository } from '@app/features/comment/infrastructure/mongo/comment.query.repository';
import { CommentQueryParam } from '@app/features/comment/models/comment.query.param.type';
import { BasicAuthGuard } from '@app/features/auth/guards/basic.guard';
import { BlogQueryParamModel } from '@app/features/sa/models/blog.query.param';
import { PostQueryRepositoryTypeorm } from '@app/features/post/infrastructure/typeorm/post.query.repository.typeorm';

import { BlogCreateType } from '../models/blog.create.type';
import { CreateBlogCommand } from '../application/useCases/create.blog.use.case';
import { PostCreateByIdType } from '../models/post.create.by.id.type';
import { BlogUpdateType } from '../models/blog.update.type';
import { UpdateBlogCommand } from '../application/useCases/update.blog.use.case';
import { PostUpdateByIdModel } from '../models/post.update.by.id';
import { UpdatePostByBlogIdCommand } from '../application/useCases/update.post.by.blog.id.use.case';
import { DeleteBlogCommand } from '../application/useCases/delete.blog.use.case';
import { DeletePostByBlogIdCommand } from '../application/useCases/delete.post.by.blog.id.use.case';
import { BlogQueryRepositoryTypeorm } from '../infrastructure/typeorm/blog.query.repository.typeorm';

@Controller('sa/blogs')
export class BloggerController {
  constructor(
    private commandBus: CommandBus,
    private postQueryRepository: PostQueryRepositoryTypeorm,
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
    private commentQueryRepository: CommentQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() blog: BlogCreateType) {
    const blogId: string = await this.commandBus.execute(
      new CreateBlogCommand(blog),
    );

    return this.blogQueryRepository.findBlogViewById(blogId);
  }

  @UseGuards(BasicAuthGuard)
  @Post('/:id/posts')
  async createPostByBlogId(
    @Param('id') id: string,
    @Body() inputData: PostCreateByIdType,
    @Res() res: Response,
  ) {
    const postId = await this.commandBus.execute(
      new CreatePostByBlogIdCommand(inputData, id),
    );
    if (!postId) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    const post = await this.postQueryRepository.findPostByIdForPublic(postId);
    return res.status(STATUS_CODE.CREATED).send(post);
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  async getBlogs(@Query() queryParam: BlogQueryParamModel) {
    return this.blogQueryRepository.findAllBlogsView(queryParam);
  }

  @UseGuards(BasicAuthGuard)
  @Get('/:id/posts')
  async getPostByBlogId(
    @Param('id') id: string,
    @Res() res: Response,
    @Query() queryParam: PostQueryParamType,
    @Request() req,
  ) {
    const userId = req.user;

    const blog = await this.blogQueryRepository.findBlogViewById(id);
    if (!blog) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    const posts = await this.postQueryRepository.findPostByBlogForBlogger(
      id,
      queryParam,
      userId,
    );

    return res.status(STATUS_CODE.OK).send(posts);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:id')
  async updateBlog(
    @Param('id') id: string,
    @Body() updateData: BlogUpdateType,
    @Res() res: Response,
  ) {
    const isUpdate = await this.commandBus.execute(
      new UpdateBlogCommand(updateData, id),
    );
    if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:blogId/posts/:postId')
  async updatePostById(
    @Param() param,
    @Body() inputData: PostUpdateByIdModel,
    @Res() res: Response,
  ) {
    const blogId = param.blogId;
    const postId = param.postId;

    const isUpdate = await this.commandBus.execute(
      new UpdatePostByBlogIdCommand(postId, blogId, inputData),
    );

    if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  async deleteBlog(@Param('id') id: string, @Res() res: Response) {
    const isDelete = await this.commandBus.execute(new DeleteBlogCommand(id));
    if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':blogId/posts/:postId')
  async deletePostByBlogId(@Param() param, @Res() res: Response) {
    const postId = param.postId;
    const blogId = param.blogId;

    const isDelete = await this.commandBus.execute(
      new DeletePostByBlogIdCommand(postId, blogId),
    );

    if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard)
  @Get('comments')
  async getAllCommentsPosts(
    @Request() req,
    @Query() queryParam: CommentQueryParam,
  ) {
    const userId = req.user;
    return this.commentQueryRepository.findAllCommentBlog(userId, queryParam);
  }
}
