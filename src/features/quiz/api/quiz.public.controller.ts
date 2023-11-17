import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { AnswerCreateModel } from '@quiz/models/create.answer.model';
import { QuizGameQueryParamModel } from '@quiz/models/quiz.game.query.param.model';
import { TopUsersQueryParamModel } from '@quiz/models/top.users.query.param.model';
import { QuizQueryRepositoryTypeorm } from '@quiz/repository/typeorm/quiz.query.repository.typeorm';
import { AddAnswerCommand } from '@quiz/usecases/add.answer.use.case';
import { ConnectionGameCommand } from '@quiz/usecases/connection.game.use.case';
import { STATUS_CODE } from '@utils/enum/status.code';
import { Response } from 'express';

@Controller('pair-game-quiz')
export class QuizPublicController {
  constructor(
    private commandBus: CommandBus,
    private quizQueryRepository: QuizQueryRepositoryTypeorm,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('users/my-statistic')
  async getStatistic(@Req() req) {
    const userId = req.user;

    const statistic = await this.quizQueryRepository.findMyStatistic(userId);
    return statistic;
  }

  @Get('users/top')
  async getTopUsers(@Query() queryParam: TopUsersQueryParamModel) {
    const users = await this.quizQueryRepository.findTopUsers(queryParam);
    return users;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/pairs/my')
  async myGames(
    @Req() req,
    @Param() queryParam: QuizGameQueryParamModel,
    @Res() res: Response,
  ) {
    const userId = req.user;
    const player = await this.quizQueryRepository.findPlayerById(userId);
    if (!player) return res.sendStatus(HttpStatus.BAD_REQUEST);

    const games = await this.quizQueryRepository.findMyGamesByUserId(
      player.id,
      queryParam,
    );

    return res.status(HttpStatus.OK).send(games);
  }

  @UseGuards(JwtAuthGuard)
  @Post('pairs/connection')
  async connectionGame(@Req() req, @Res() res: Response) {
    const userId = req.user;

    const gameId = await this.commandBus.execute(
      new ConnectionGameCommand(userId),
    );

    const game = await this.quizQueryRepository.findGameByGameId(gameId);
    return res.status(200).send(game);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/my-current')
  async findMyActiveGame(@Req() req, @Res() res: Response) {
    const userId = req.user;

    const player = await this.quizQueryRepository.findPlayerById(userId);
    if (!player) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    const game = await this.quizQueryRepository.findMyCurrentGameByUserId(
      player.id,
    );
    if (!game) return res.sendStatus(STATUS_CODE.NOT_FOUND);

    return res.status(STATUS_CODE.OK).send(game);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/:id')
  async findQuizGameById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res() res: Response,
    @Req() req,
  ) {
    const userId = req.user;

    const game = await this.quizQueryRepository.findGameByGameId(id);
    if (!game) return res.sendStatus(STATUS_CODE.NOT_FOUND);
    if (
      game.firstPlayerProgress.player.id !== userId &&
      game.secondPlayerProgress?.player.id !== userId
    )
      throw new ForbiddenException();

    return res.status(STATUS_CODE.OK).send(game);
  }

  @UseGuards(JwtAuthGuard)
  @Post('pairs/my-current/answers')
  async postAnswer(
    @Body() inputData: AnswerCreateModel,
    @Req() req,
    @Res() res: Response,
  ) {
    const userId = req.user;

    const answerId = await this.commandBus.execute(
      new AddAnswerCommand(inputData, userId),
    );
    if (!answerId) return res.sendStatus(STATUS_CODE.BAD_REQUEST);

    const answer = await this.quizQueryRepository.findAnswerById(answerId);

    return res.status(STATUS_CODE.OK).send(answer);
  }
}
