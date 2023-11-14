import {
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Res,
  Body,
} from '@nestjs/common';
import { Response } from 'express';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { UserCreateType } from '@app/features/user/models/user.create.type';
import { ConfirmationCodeType } from '@app/utils/custom-validation/confirmation.code.type';
import { STATUS_CODE } from '@app/utils/enum/status.code';
import { CreateDeviceCommand } from '@app/features/security/application/useCases/create.device.use.case';
import { RegistrationUserCommand } from '@app/features/user/application/useCases/registration.user.use.case';
import { EmailConfirmationCommand } from '@app/features/user/application/useCases/email.confirmation.use.case';
import { ResendingConfirmationCodeCommand } from '@app/features/user/application/useCases/resending.confirmation.code.use.case';
import { UserQueryRepositoryTypeorm } from '@app/features/user/infrastructure/typeorm/user.query.repository.typeorm';

import { LoginUserCommand } from '../application/useCases/login.user.use.case';
import { CreateRefreshTokenCommand } from '../application/useCases/create.refresh.token.use.case';
import { AddRefreshTokenInBlackListCommand } from '../application/useCases/add.refresh.token.in.black.list.use.case';
import { JwtRefreshTokenGuard } from '../guards/jwt.refresh.token.guard';
import { EmailType } from '../models/email.type';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { LocalAuthGuard } from '../guards/local.guard';

@Controller('/auth')
export class AuthController {
  constructor(
    private userQueryRepository: UserQueryRepositoryTypeorm,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @Post('/login')
  async login(@Request() req, @Res() res: Response) {
    const deviceId = await this.commandBus.execute(
      new CreateDeviceCommand(req.user.id, req.ip, req.headers['user-agent']),
    );

    const token = await this.commandBus.execute(
      new LoginUserCommand(req.user.id),
    );
    const refreshToken = await this.commandBus.execute(
      new CreateRefreshTokenCommand(req.user.id, deviceId),
    );

    res
      .status(STATUS_CODE.OK)
      .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
      .send(token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getMe(@Request() req) {
    const user = await this.userQueryRepository.findMe(req.user);
    return user;
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration')
  async registrationUser(
    @Body() inputData: UserCreateType,
    @Res() res: Response,
  ) {
    const isCreated = await this.commandBus.execute(
      new RegistrationUserCommand(inputData),
    );
    if (!isCreated) return res.sendStatus(STATUS_CODE.BAD_REQUEST);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration-confirmation')
  async registrationConfirmation(
    @Body() code: ConfirmationCodeType,
    @Res() res: Response,
  ) {
    const isConfirmed = await this.commandBus.execute(
      new EmailConfirmationCommand(code),
    );
    if (!isConfirmed) return res.sendStatus(STATUS_CODE.BAD_REQUEST);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(ThrottlerGuard)
  @Post('/registration-email-resending')
  async registrationEmailResending(
    @Body() email: EmailType,
    @Res() res: Response,
  ) {
    const isResending = await this.commandBus.execute(
      new ResendingConfirmationCodeCommand(email),
    );
    if (!isResending) return res.sendStatus(STATUS_CODE.BAD_REQUEST);

    return res.sendStatus(STATUS_CODE.NO_CONTENT);
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Post('refresh-token')
  async updateRefreshRoken(@Request() req, @Res() res: Response) {
    await this.commandBus.execute(
      new AddRefreshTokenInBlackListCommand(req.cookies.refreshToken),
    );

    const token = await this.commandBus.execute(
      new LoginUserCommand(req.user.userId),
    );
    const refreshToken = await this.commandBus.execute(
      new CreateRefreshTokenCommand(req.user.userId, req.user.deviceId),
    );

    if (!refreshToken) res.sendStatus(401);

    res
      .status(STATUS_CODE.OK)
      .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
      .send(token);
  }

  @Post('/logout')
  @UseGuards(JwtRefreshTokenGuard)
  async logoutUser(@Request() req, @Res() res: Response) {
    await this.commandBus.execute(
      new AddRefreshTokenInBlackListCommand(
        req.cookies.refreshToken,
        req.user.deviceId,
      ),
    );
    return res.sendStatus(204);
  }
}
