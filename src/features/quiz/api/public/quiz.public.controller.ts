import { Body, Controller, ForbiddenException, Get, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "src/features/auth/guards/jwt.guard";
import { ConnectionQuizGameCommand } from "../../application/useCases/connection.quiz.game.use.case";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { Response } from 'express'
import { STATUS_CODE } from "src/entity/enum/status.code";
import { QuizAnswerModel } from "../../models/quiz.answer.model";
import { PostAnswerCommand } from "../../application/useCases/post.answer.use.case";


@Controller('pair-game-quiz/pairs')
export class QuizPublicController {
    constructor(
        private commandBus: CommandBus,
        private quizQueryRepository: QuizQueryRepositoryTypeorm
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('/connection')
    async connectionGame(
        @Req() req
    ) {
        const userId = req.user

        const gameId = await this.commandBus.execute(new ConnectionQuizGameCommand(userId))

        const game = await this.quizQueryRepository.findQuizGameById(gameId)

        return game
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async findGame(
        @Param('id') id: string,
        @Req() req,
        @Res() res: Response
    ) {
        const userId = req.user

        const quizGame = await this.quizQueryRepository.findQuizGameById(id)

        if (!quizGame) return res.sendStatus(STATUS_CODE.NOT_FOUND)
        // if (quizGame.firstPlayer.id !== userId && quizGame.secondPlayer.id !== userId) throw new ForbiddenException()

        return res.status(STATUS_CODE.OK).send(quizGame)
    }

    @UseGuards(JwtAuthGuard)
    @Post('/answers')
    async postAnswer(
        @Req() req,
        @Body() inputData: QuizAnswerModel
    ) {
        const userId = req.user

        const answer = await this.commandBus.execute(new PostAnswerCommand(userId, inputData))
        return answer
        // TODO: вызвать команду PostAnswerCommand и провеить что возвращает
    }

}