import { BasicAuthGuard } from '@auth/guards/basic.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { SaQueryRepository } from '@sa/repository/sa.query.repository';
import { BlogBanInputDataModel } from '@sa/models/blog.ban.input.data.model';
import { BlogQueryParamModel } from '@sa/models/blog.query.param';
import { BindUserForBlogCommand } from '@sa/usecases/bind.user.for.blog.use.case';
import { BlogBanCommand } from '@sa/usecases/blog.ban.use.case';
import { STATUS_CODE } from '@utils/enum/status.code';
import { Response } from 'express';
import { SaQueryRepositoryTypeorm } from '@sa/repository/sa.query.repository.typeorm';

@Controller('sa')
export class SaBlogController {
  constructor(
    private commandBus: CommandBus,
    private saQueryRepository: SaQueryRepositoryTypeorm
  ) { }

  @UseGuards(BasicAuthGuard)
  @Put('blogs/:blogId/bind-with-user/:userId')
  async bindUserIdForBlog(@Param() param, @Res() res: Response) {
    const userId = param.userId;
    const blogId = param.blogId;

    const isUpdate = await this.commandBus.execute(
      new BindUserForBlogCommand(userId, blogId),
    );
    if (!isUpdate) return res.sendStatus(STATUS_CODE.BAD_REQUEST);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  // TODO: переделать на typeorm repository
  @UseGuards(BasicAuthGuard)
  @Get('blogs')
  async getAllBlogs(@Query() queryParam: BlogQueryParamModel) {
    return await this.saQueryRepository.findBlogsForSa(queryParam);
  }

  @UseGuards(BasicAuthGuard)
  @Put('blogs/:id/ban')
  async banBlog(
    @Param('id') blogId,
    @Body() inputData: BlogBanInputDataModel,
    @Res() res: Response,
  ) {
    const isBanned = await this.commandBus.execute(
      new BlogBanCommand(blogId, inputData),
    );

    if (!isBanned) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }
}
