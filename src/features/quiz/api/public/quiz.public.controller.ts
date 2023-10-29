import { Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Post, Req, Res, UseGuards, assignMetadata } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../../../../features/auth/guards/jwt.guard";
import { Response } from 'express'
import { STATUS_CODE } from "../../../../entity/enum/status.code";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { AnswerCreateModel } from "../../models/create.answer.model";
import { ConnectionGameCommand } from "../../application/useCases/connection.game.use.case";
import { AddAnswerCommand } from "../../application/useCases/add.answer.use.case";


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
        const userId = req.user
        
        const player = await this.quizQueryRepository.findPlayerById(userId)
        if(!player) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        const game = await this.quizQueryRepository.findMyCurrentGameByUserId(player.id)
        if (!game) return res.sendStatus(STATUS_CODE.NOT_FOUND)
        // console.log(game.firstPlayerProgress.answers)
        return res.status(STATUS_CODE.OK).send(game)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async findQuizGameById(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Res() res: Response,
        @Req() req
    ) {
        const userId = req.user

        const game = await this.quizQueryRepository.findGameByGameId(id)
        if (!game) return res.sendStatus(STATUS_CODE.NOT_FOUND)
        if (
            game.firstPlayerProgress.player.id !== userId &&
            game.secondPlayerProgress?.player.id !== userId
        ) throw new ForbiddenException()

        return res.status(STATUS_CODE.OK).send(game)
    }

    @UseGuards(JwtAuthGuard)
    @Post('/my-current/answers')
    async postAnswer(
        @Body() inputData: AnswerCreateModel,
        @Req() req,
        @Res() res: Response
    ) {
        const userId = req.user

        const answerId = await this.commandBus.execute(new AddAnswerCommand(inputData, userId))
        if (!answerId) return res.sendStatus(STATUS_CODE.BAD_REQUEST)

        const answer = await this.quizQueryRepository.findAnswerById(answerId)

        return res.status(STATUS_CODE.OK).send(answer)

    }

    @UseGuards(JwtAuthGuard)
    @Get('users/my-statistic')
    async getStatistic(
        @Req() req
    ){
        const userId = req.user

        const statistic = await this.quizQueryRepository.findMyStatistic(userId)
        return statistic
    }
}