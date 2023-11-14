import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { PostQueryParamType } from '@app/features/post/models/post.query.param.type';
import { JwtOrNotGuard } from '@app/features/auth/guards/jwt.or.not.guard';
import { STATUS_CODE } from '@app/utils/enum/status.code';
import { BlogQueryParamModel } from '@app/features/sa/infrastructure/models/blog.query.param';
import { PostQueryRepositoryTypeorm } from '@app/features/post/infrastructure/typeorm/post.query.repository.typeorm';

import { BlogQueryRepositoryTypeorm } from '../infrastructure/typeorm/blog.query.repository.typeorm';

@Controller('blogs')
export class BlogController {
  constructor(
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
    private readonly postQueryRepository: PostQueryRepositoryTypeorm,
  ) {}

  @Get()
  async getBlogs(@Query() queryParam: BlogQueryParamModel) {
    return this.blogQueryRepository.findAllBlogsView(queryParam);
  }

  @Get('/:id')
  async getBlog(@Param('id') id: string, @Res() res: Response) {
    const blog = await this.blogQueryRepository.findBlogViewById(id);
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

    const blog = await this.blogQueryRepository.findBlogViewById(id);
    if (!blog) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    const posts = await this.postQueryRepository.findPostByBlogForBlogger(
      id,
      queryParam,
      userId,
    );

    return res.status(STATUS_CODE.OK).send(posts);
  }
}
