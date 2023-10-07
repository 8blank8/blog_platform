import { Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Post, Req, Res, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../../../../features/auth/guards/jwt.guard";
import { ConnectionQuizGameCommand } from "../../application/useCases/connection.quiz.game.use.case";
import { Response } from 'express'
import { STATUS_CODE } from "../../../../entity/enum/status.code";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { AnswerCreateModel } from "../../models/create.answer.model";
import { PostAnswerQuizGameCommand } from "../../application/useCases/post.answer.quiz.game.use.case";


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

        const gameId = await this.commandBus.execute(new ConnectionQuizGameCommand(userId))
        const game = await this.quizQueryRepository.findGameById(gameId)

        return res.status(STATUS_CODE.OK).send(game)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/my-current')
    async findMyActiveGame(
        @Req() req,
        @Res() res: Response
    ) {
        const userId = req.user

        const game = await this.quizQueryRepository.findMyActiveGame(userId)
        console.log(game)
        if (!game) return res.sendStatus(STATUS_CODE.NOT_FOUND)

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
        console.log(id)
        const game = await this.quizQueryRepository.findGameById(id)
        if (!game) return res.sendStatus(STATUS_CODE.NOT_FOUND)
        if (game.firstPlayerProgress.player.id !== userId && game.secondPlayerProgress?.player.id !== userId) throw new ForbiddenException()

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

        const answerId = await this.commandBus.execute(new PostAnswerQuizGameCommand(inputData, userId))

        const answer = await this.quizQueryRepository.findAnswerById(answerId)

        return res.status(STATUS_CODE.OK).send(answer)
    }

}