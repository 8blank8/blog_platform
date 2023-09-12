import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from "@nestjs/common";
import { Response } from 'express';
import { UserCreateType } from "../models/user.create.type";
import { UserQueryRepository } from "../infrastructure/mongo/user.query.repository";
import { UserQueryParamType } from "../models/user.query.param.type";
import { BasicAuthGuard } from "../../auth/guards/basic.guard";
import { CommandBus } from "@nestjs/cqrs";
import { CreateUserCommand } from "../application/useCases/create.user.use.case";
import { DeleteUserCommand } from "../application/useCases/delete.user.use.case";
import { STATUS_CODE } from "../../../entity/enum/status.code";
import { UserBanModel } from "../models/user.ban.model";
import { BannedUserCommand } from "../application/useCases/banned.user.use.case";
import { UserQueryRepositorySql } from "../infrastructure/sql/user.query.repository.sql";
import { UserQueryRepositoryTypeorm } from "../infrastructure/typeorm/user.query.repository.typeorm";


@Controller('sa/users')
export class UserController {

    constructor(
        // private userQueryRepository: UserQueryRepository,
        private commandBus: CommandBus,
        private userQueryRepository: UserQueryRepositoryTypeorm
    ) { }

    @UseGuards(BasicAuthGuard)
    @Post()
    async createUser(
        @Body() inputData: UserCreateType
    ) {
        const userId: string = await this.commandBus.execute(new CreateUserCommand(inputData))
        const user = await this.userQueryRepository.findUserByIdForSa(userId)

        return user
    }

    @UseGuards(BasicAuthGuard)
    @Get()
    async getUsers(
        @Query() queryParam: UserQueryParamType
    ) {
        return await this.userQueryRepository.findAllUsers(queryParam)
        // return await this.userQueryRepository.findAllUsersForSa(queryParam)
    }

    @UseGuards(BasicAuthGuard)
    @Delete('/:id')
    async deleteUser(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const isDelete = await this.commandBus.execute(new DeleteUserCommand(id))
        if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(BasicAuthGuard)
    @Put('/:id/ban')
    async banUser(
        @Param("id") userId,
        @Body() inuptData: UserBanModel,
        @Res() res: Response
    ) {
        const isBanned = await this.commandBus.execute(
            new BannedUserCommand(inuptData, userId)
        )

        if (!isBanned) return res.sendStatus(STATUS_CODE.BAD_REQUEST)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

}