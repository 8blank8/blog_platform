import { Controller, Get, Param, Put, Query, Res, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { BasicAuthGuard } from "../../auth/guards/basic.guard";
import { BindUserForBlogCommand } from "../application/useCases/bind.user.for.blog.use.case";
import { Response } from 'express'
import { STATUS_CODE } from "../../../entity/enum/status.code";
import { SaQueryRepository } from "../infrastructure/sa.query.repository";
import { BlogQueryParamModel } from "../infrastructure/models/blog.query.param";

@Controller('sa')
export class SaBlogController {
    constructor(
        private commandBus: CommandBus,
        private saQueryRepository: SaQueryRepository
    ) { }

    @UseGuards(BasicAuthGuard)
    @Put('blogs/blogId/bind-with-user/userId')
    async bindUserIdForBlog(
        @Param() param,
        @Res() res: Response
    ) {
        const userId = param.userId
        const blogId = param.blogId

        const isUpdate = await this.commandBus.execute(new BindUserForBlogCommand(userId, blogId))
        if (!isUpdate) return res.sendStatus(STATUS_CODE.BAD_REQUEST)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(BasicAuthGuard)
    @Get('blogs')
    async getAllBlogs(
        @Query() queryParam: BlogQueryParamModel
    ) {
        return await this.saQueryRepository.findAllBlogs(queryParam)
    }
}