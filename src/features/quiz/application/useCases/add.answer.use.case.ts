import { CommandHandler } from "@nestjs/cqrs";
import { AnswerCreateModel } from "../../models/create.answer.model";
import { UserQueryRepositoryTypeorm } from "../../../user/infrastructure/typeorm/user.query.repository.typeorm";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { ForbiddenException } from "@nestjs/common";
import { Answer } from "../../domain/typeorm/answer.entity";
import { QuizRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.repository.typeorm";
import { log } from "console";


export class AddAnswerCommand {
    constructor(
        public inputData: AnswerCreateModel,
        public userId: string
    ) { }
}

@CommandHandler(AddAnswerCommand)
export class AddAnswerUseCase {
    constructor(
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private quizQueryRepository: QuizQueryRepositoryTypeorm,
        private quizRepository: QuizRepositoryTypeorm
    ) { }

    async execute(command: AddAnswerCommand): Promise<string | boolean> {

        const { inputData, userId } = command

        const user = await this.userQueryRepository.findUserByIdForSa(userId)
        if (!user) throw new ForbiddenException()

        const game = await this.quizQueryRepository.findMyCurrentGameFullByUserId(userId)
        if (!game) throw new ForbiddenException()
        if (!game.secondPlayer) throw new ForbiddenException()

        const firstPlayerAnswersCount = !game.answer ? 0 : game.answer.filter(answer => answer.userId === user.id).length
        if (firstPlayerAnswersCount === 5) throw new ForbiddenException()

        let secondPlayerId: string
        if (game.firstPlayer.id === user.id) {
            secondPlayerId = game.secondPlayer.id
        } else {
            secondPlayerId = game.firstPlayer.id
        }

        const createdAnswer = new Answer()
        // createdAnswer.game = game
        createdAnswer.gameId = game.id
        createdAnswer.user = user
        createdAnswer.userId = user.id
        createdAnswer.question = game.questions[firstPlayerAnswersCount]
        createdAnswer.questionId = game.questions[firstPlayerAnswersCount].id
        createdAnswer.addedAt = new Date().toISOString()

        const answer = game.questions[firstPlayerAnswersCount].correctAnswers.find(item => item === inputData.answer)

        if (answer) {
            createdAnswer.answerStatus = 'Correct'
        } else {
            createdAnswer.answerStatus = 'Incorrect'
        }

        let gameAnswers
        if (game.answer) {
            gameAnswers = [...game.answer, createdAnswer]
        } else {
            gameAnswers = [createdAnswer]
        }

        game.answer = gameAnswers

        await this.quizRepository.saveGame(game)
        // log(createdAnswer, 'IN UC AFTER SAVE')
        await this.quizRepository.saveAnswer(createdAnswer)


        const score = await this.quizQueryRepository.findPlayerScoreByUserId(game.id, user.id)

        if (score && answer) {
            score.score = score.score + 1
            await this.quizRepository.saveScore(score)
        }


        const isFinished = await this.checkFinishGame(user.id)
        if (isFinished) {
            game.finishGameDate = new Date().toISOString()
            game.status = 'Finished'
            await this.quizRepository.saveGame(game)
        }


        await this.checkAddBonus(game.id, user.id, secondPlayerId)
        // console.log(createdAnswer, 'IN UC FOR RETURN')
        return createdAnswer.id
    }

    private async checkFinishGame(userId: string) {
        const game = await this.quizQueryRepository.findMyCurrentGameFullByUserId(userId)
        if (!game) return false

        return game.answer.length === 10 ? true : false
    }

    private async checkAddBonus(gameId: string, firstPlayerId: string, secondPlayerId: string) {

        const game = await this.quizQueryRepository.findFullGameByGameId(gameId)
        if (!game || game.status !== "Finished") return false

        const firstAnswerUserId = game.answer[0].userId
        const score = await this.quizQueryRepository.findPlayerScoreByUserId(game.id, firstAnswerUserId)

        if (score) {
            score.score = score.score + 1
            await this.quizRepository.saveScore(score)
        }
    }
}