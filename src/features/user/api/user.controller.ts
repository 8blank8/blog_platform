import { Body, Controller, Delete, Get, Param, Post, Query, Res, UseGuards } from "@nestjs/common";
import { Response } from 'express';
import { UserCreateType } from "../models/user.create.type";
import { UserQueryRepository } from "../infrastructure/user.query.repository";
import { UserQueryParamType } from "../models/user.query.param.type";
import { BasicAuthGuard } from "../../auth/guards/basic.guard";
import { CommandBus } from "@nestjs/cqrs";
import { CreateUserCommand } from "../application/useCases/create.user.use.case";
import { DeleteUserCommand } from "../application/useCases/delete.user.use.case";
import { STATUS_CODE } from "../../../entity/enum/status.code";


@Controller('sa/users')
export class UserController {

    constructor(
        private readonly userQueryRepository: UserQueryRepository,
        private commandBus: CommandBus
    ) { }

    @UseGuards(BasicAuthGuard)
    @Post()
    async createUser(
        @Body() inputData: UserCreateType
    ) {
        const userId: string = await this.commandBus.execute(new CreateUserCommand(inputData))
        const user = await this.userQueryRepository.findUserById(userId)

        return user
    }

    @Get()
    async getUsers(
        @Query() queryParam: UserQueryParamType
    ) {
        return await this.userQueryRepository.findAllUsers(queryParam)
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

}