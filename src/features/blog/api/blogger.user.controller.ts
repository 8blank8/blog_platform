import {
  Body,
  Controller,
  Param,
  Put,
  UseGuards,
  Request,
  Res,
  Get,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { STATUS_CODE } from '@utils/enum/status.code';
import { BanUserForBlogModel } from '@blog/models/ban.user.for.blog.model';
import { BanUserForBlogCommand } from '@blog/usecases/ban.user.for.blog.use.case';
import { UsersBanQueryParamModel } from '@blog/models/users.ban.query.param.model';
import { UserBanBlogQueryRepository } from '@blog/repository/mongo/user.ban.blog.query.repository';
import { BlogQueryRepository } from '@blog/repository/mongo/blog.query.repository';
import { UserBlogBanQueryRepositoryTypeorm } from '@blog/repository/typeorm/user.ban.blog.query.repository';
import { BlogQueryRepositoryTypeorm } from '@blog/repository/typeorm/blog.query.repository.typeorm';

@Controller('blogger/users')
export class BloggerUserController {
  constructor(
    private commandBus: CommandBus,
    private userBanBlogQueryRepository: UserBlogBanQueryRepositoryTypeorm,
    private blogQueryRepository: BlogQueryRepositoryTypeorm,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Put('/:id/ban')
  async banUserForBlog(
    @Param('id') bannedUserId,
    @Body() inputData: BanUserForBlogModel,
    @Request() req,
    @Res() res: Response,
  ) {
    const userId = req.user;

    const isBanned = await this.commandBus.execute(
      new BanUserForBlogCommand(inputData, bannedUserId, userId),
    );
    if (!isBanned) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/blog/:id')
  async findBannedUsersForBlog(
    @Param('id') blogId,
    @Query() queryParam: UsersBanQueryParamModel,
    @Res() res: Response,
    @Request() req,
  ) {
    const blog = await this.blogQueryRepository.findFullBlogById(blogId);
    if (!blog) return res.sendStatus(STATUS_CODE.NOT_FOUND);
    if (blog.user.id !== req.user) throw new ForbiddenException();

    const bannedUsers = await this.userBanBlogQueryRepository.findBannedUsers(
      blogId,
      queryParam,
    );
    return res.status(STATUS_CODE.OK).send(bannedUsers);
  }
}
