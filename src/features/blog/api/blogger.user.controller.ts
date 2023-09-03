import { Body, Controller, Param, Put, UseGuards, Request, Res, Get, Query, ForbiddenException } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "src/features/auth/guards/jwt.guard";
import { BanUserForBlogModel } from "../models/ban.user.for.blog.model";
import { Response } from 'express'
import { STATUS_CODE } from "src/entity/enum/status.code";
import { BanUserForBlogCommand } from "../application/useCases/ban.user.for.blog.use.case";
import { UsersBanQueryParamModel } from "../models/users.ban.query.param.model";
import { UserBanBlogQueryRepository } from "../infrastructure/mongo/user.ban.blog.query.repository";
import { BlogQueryRepository } from "../infrastructure/mongo/blog.query.repository";


@Controller('blogger/users')
export class BloggerUserController {
    constructor(
        private commandBus: CommandBus,
        private userBanBlogQueryRepository: UserBanBlogQueryRepository,
        private blogQueryRepository: BlogQueryRepository
    ) { }

    @UseGuards(JwtAuthGuard)
    @Put('/:id/ban')
    async banUserForBlog(
        @Param('id') bannedUserId,
        @Body() inputData: BanUserForBlogModel,
        @Request() req,
        @Res() res: Response
    ) {
        const userId = req.user

        const isBanned = await this.commandBus.execute(
            new BanUserForBlogCommand(inputData, bannedUserId, userId)
        )
        if (!isBanned) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtAuthGuard)
    @Get("/blog/:id")
    async findBannedUsersForBlog(
        @Param('id') blogId,
        @Query() queryParam: UsersBanQueryParamModel,
        @Res() res: Response,
        @Request() req
    ) {
        const blog = await this.blogQueryRepository.findBlogDocumentById(blogId)
        if (!blog) return res.sendStatus(STATUS_CODE.NOT_FOUND)
        if (blog.userId !== req.user) throw new ForbiddenException()

        const bannedUsers = await this.userBanBlogQueryRepository.findBannedUsers(blogId, queryParam)
        return res.status(STATUS_CODE.OK).send(bannedUsers)
    }

}