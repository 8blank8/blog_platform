import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { UserQueryRepositoryTypeorm } from '@user/repository/typeorm/user.query.repository.typeorm';
import { BasicAuthGuard } from '@auth/guards/basic.guard';
import { UserCreateType } from '@user/models/user.create.type';
import { CreateUserCommand } from '@user/usecases/create.user.use.case';
import { UserQueryParamType } from '@user/models/user.query.param.type';
import { DeleteUserCommand } from '@user/usecases/delete.user.use.case';
import { STATUS_CODE } from '@utils/enum/status.code';
import { UserBanModel } from '@user/models/user.ban.model';
import { BannedUserCommand } from '@user/usecases/banned.user.use.case';

@Controller('sa/users')
export class UserController {
  constructor(
    private commandBus: CommandBus,
    private userQueryRepository: UserQueryRepositoryTypeorm,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() inputData: UserCreateType) {
    const userId: string = await this.commandBus.execute(
      new CreateUserCommand(inputData),
    );
    const user = await this.userQueryRepository.findUserByIdForSa(userId);

    return user;
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  async getUsers(@Query() queryParam: UserQueryParamType) {
    return await this.userQueryRepository.findAllUsers(queryParam);
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/:id')
  async deleteUser(@Param('id') id: string, @Res() res: Response) {
    const isDelete = await this.commandBus.execute(new DeleteUserCommand(id));
    if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/:id/ban')
  async banUser(
    @Param('id') userId,
    @Body() inuptData: UserBanModel,
    @Res() res: Response,
  ) {
    const isBanned = await this.commandBus.execute(
      new BannedUserCommand(inuptData, userId),
    );

    if (!isBanned) return res.sendStatus(STATUS_CODE.BAD_REQUEST);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }
}
