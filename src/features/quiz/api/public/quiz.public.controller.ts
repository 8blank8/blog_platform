import { Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Post, Req, Res, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../../../../features/auth/guards/jwt.guard";
import { Response } from 'express'
import { STATUS_CODE } from "../../../../entity/enum/status.code";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { AnswerCreateModel } from "../../models/create.answer.model";
import { ConnectionGameCommand } from "../../application/useCases/connection.game.use.case";


@Controller('pair-game-quiz/pairs')
export class QuizPublicController {
    constructor(
        private commandBus: CommandBus,
        private quizQueryRepository: QuizQueryRepositoryTypeorm
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('/connection')
    async connectionGame(
        @Req() req,
        @Res() res: Response
    ) {
        const userId = req.user

        const gameId = await this.commandBus.execute(new ConnectionGameCommand(userId))

        const game = await this.quizQueryRepository.findGameByGameId(gameId)

        return res.status(200).send(game)
        // TODO: доделать мапинг данный и получение пользователя в дате игры
        // TODO: get game data by id and return game
    }

    @UseGuards(JwtAuthGuard)
    @Get('/my-current')
    async findMyActiveGame(
        @Req() req,
        @Res() res: Response
    ) {
        return res.sendStatus(200)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async findQuizGameById(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Res() res: Response,
        @Req() req
    ) {
        return res.sendStatus(200)

  
    }

    @UseGuards(JwtAuthGuard)
    @Post('/my-current/answers')
    async postAnswer(
        @Body() inputData: AnswerCreateModel,
        @Req() req,
        @Res() res: Response
    ) {
        return res.sendStatus(200)
    
    }

}