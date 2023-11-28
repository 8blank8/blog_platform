import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  Request,
  UseGuards,
  Req,
  Post,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { Response } from 'express';
import { PostQueryParamType } from '@post/models/post.query.param.type';
import { JwtOrNotGuard } from '@auth/guards/jwt.or.not.guard';
import { STATUS_CODE } from '@utils/enum/status.code';
import { BlogQueryParamModel } from '@sa/models/blog.query.param';
import { PostQueryRepositoryTypeorm } from '@post/repository/typeorm/post.query.repository.typeorm';
import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSubscriptionBlogCommand } from '@blog/usecases/create.subscription.blog.use.case';
import { DeleteSubscriptionBlogCommand } from '@blog/usecases/delete.subscription.blog.use.case';
import { userInfo } from 'os';

@Controller('blogs')
export class BlogController {
  constructor(
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
    private postQueryRepository: PostQueryRepositoryTypeorm,
    private commandBus: CommandBus
  ) { }

  @UseGuards(JwtOrNotGuard)
  @Get()
  async getBlogs(
    @Query() queryParam: BlogQueryParamModel,
    @Req() req
  ) {
    const userId = req.user

    return this.blogQueryRepository.findAllBlogsView(queryParam, userId);
  }

  @UseGuards(JwtOrNotGuard)
  @Get('/:id')
  async getBlog(@Param('id') id: string, @Res() res: Response, @Req() req) {
    const userId = req.user

    const blog = await this.blogQueryRepository.findBlogViewById(id, userId);
    if (!blog) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.send(blog);
  }

  @UseGuards(JwtOrNotGuard)
  @Get('/:id/posts')
  async getPostByBlogId(
    @Param('id') id: string,
    @Res() res: Response,
    @Query() queryParam: PostQueryParamType,
    @Request() req,
  ) {
    const userId = req.user;

    const blog = await this.blogQueryRepository.findBlogViewById(id, userId);
    if (!blog) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    const posts = await this.postQueryRepository.findPostByBlogForBlogger(
      id,
      queryParam,
      userId,
    );

    return res.status(STATUS_CODE.OK).send(posts);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':blogId/subscription')
  async suscriptionBlog(
    @Req() req,
    @Res() res: Response,
    @Param('blogId') blogId: string
  ) {
    const userId = req.user

    const isSubscription = await this.commandBus.execute(new CreateSubscriptionBlogCommand(userId, blogId))
    if (!isSubscription) res.sendStatus(HttpStatus.NOT_FOUND)

    return res.sendStatus(HttpStatus.NO_CONTENT)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':blogId/subscription')
  async deleteSuscriptionBlog(
    @Req() req,
    @Res() res: Response,
    @Param('blogId') blogId: string
  ) {
    const userId = req.user

    const isSubscription = await this.commandBus.execute(new DeleteSubscriptionBlogCommand(userId, blogId))
    if (!isSubscription) res.sendStatus(HttpStatus.NOT_FOUND)

    return res.sendStatus(HttpStatus.NO_CONTENT)
  }
}
