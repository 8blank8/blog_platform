import { Body, Controller, Delete, Get, Param, Post, Query, Res, UseGuards } from "@nestjs/common";
import { Response } from 'express';
import { UserCreateType } from "../models/user.create.type";
import { UserService } from "../application/user.service";
import { UserQueryRepository } from "../infrastructure/user.query.repository";
import { UserQueryParamType } from "../models/user.query.param.type";
import { AuthGuard } from "@nestjs/passport";


@Controller('users')
export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly userQueryRepository: UserQueryRepository
    ) { }

    @Post()
    async createUser(
        @Body() inputData: UserCreateType
    ) {
        const userId: string = await this.userService.createUser(inputData)
        const user = await this.userQueryRepository.findUserById(userId)

        return user
    }

    @Get()
    async getUsers(
        @Query() queryParam: UserQueryParamType
    ) {
        return await this.userQueryRepository.findAllUsers(queryParam)
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete('/:id')
    async deleteUser(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const isDelete = await this.userService.deleteUser(id)
        if (!isDelete) return res.sendStatus(404)

        return res.sendStatus(204)
    }

}