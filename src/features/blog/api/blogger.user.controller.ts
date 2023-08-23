import { Body, Controller, Param, Put, UseGuards, Request, Res, Get, Query } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "src/features/auth/guards/jwt.guard";
import { BanUserForBlogModel } from "../models/ban.user.for.blog.model";
import { Response } from 'express'
import { STATUS_CODE } from "src/entity/enum/status.code";
import { BanUserForBlogCommand } from "../application/useCases/ban.user.for.blog.use.case";
import { UsersBanQueryParamModel } from "../models/users.ban.query.param.model";
import { UserBanBlogQueryRepository } from "../infrastructure/user.ban.blog.query.repository";


@Controller('blogger/users')
export class BloggerUserController {
    constructor(
        private commandBus: CommandBus,
        private userBanBlogQueryRepository: UserBanBlogQueryRepository
    ) { }

    @UseGuards(JwtAuthGuard)
    @Put('/:id/ban')
    async banUserForBlog(
        @Param('id') id,
        @Body() inputData: BanUserForBlogModel,
        @Request() req,
        @Res() res: Response
    ) {
        const userId = req.user

        await this.commandBus.execute(
            new BanUserForBlogCommand(inputData, id, userId)
        )

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtAuthGuard)
    @Get("/blog/:id")
    async findBannedUsersForBlog(
        @Param('id') blogId,
        @Query() queryParam: UsersBanQueryParamModel
    ) {
        return await this.userBanBlogQueryRepository.findBannedUsers(blogId, queryParam)
    }

}