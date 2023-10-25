import { CommandHandler } from "@nestjs/cqrs";
import { AnswerCreateModel } from "../../models/create.answer.model";
import { UserQueryRepositoryTypeorm } from "../../../user/infrastructure/typeorm/user.query.repository.typeorm";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { ForbiddenException } from "@nestjs/common";
import { Answer } from "../../domain/typeorm/answer.entity";
import { QuizRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.repository.typeorm";
import { QuizScore } from "../../domain/typeorm/quiz.score.entity";
import { Game } from "../../domain/typeorm/quiz.game";


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

        let secondPlayerId: string
        if (game.firstPlayer.id === user.id) {
            secondPlayerId = game.secondPlayer.id
        } else {
            secondPlayerId = game.firstPlayer.id
        }

        const firstPlayerAnswersCount = game.answer.filter(answer => answer.userId === user.id).length
        // const secondPlayerAnswersCount = game.answer.filter(answer => answer.userId === secondPlayerId).length

        if (firstPlayerAnswersCount === 5) throw new ForbiddenException()

        const createdAnswer = new Answer()
        createdAnswer.game = game
        createdAnswer.user = user
        createdAnswer.userId = user.id
        createdAnswer.question = game.questions[firstPlayerAnswersCount]
        createdAnswer.questionId = game.questions[firstPlayerAnswersCount].id

        const answer = game.questions[firstPlayerAnswersCount].correctAnswers.find(item => item === inputData.answer)

        const score = await this.quizQueryRepository.findPlayerScoreByUserId(game.id, user.id)

        if (score && answer) {
            score.score = score.score + 1
            await this.quizRepository.saveScore(score)
        }

        if (answer) {
            createdAnswer.answerStatus = 'Correct'
        } else {
            createdAnswer.answerStatus = 'Incorrect'
        }

        await this.quizRepository.saveGame(game)
        await this.quizRepository.saveAnswer(createdAnswer)

        const isFinished = await this.checkFinishGame(user.id)
        if (isFinished) {
            game.finishGameDate = new Date().toISOString()
            game.status = 'Finished'
            await this.quizRepository.saveGame(game)
        }

        // if (firstPlayerAnswersCount === 4) {
        // }
        await this.checkAddBonus(game.id, user.id, secondPlayerId)



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
        console.log(game)

        const firstAnswerUserId =  game.answer[0].userId
        const score = await this.quizQueryRepository.findPlayerScoreByUserId(game.id, firstAnswerUserId)

        if(score){
            score.score = score.score + 1
            await this.quizRepository.saveScore(score)
        }
        // const firstPlayerAnswers = await this.quizQueryRepository.findUserAnswers(game.id, firstPlayerId)
        // const secondPlayerAnswers = await this.quizQueryRepository.findUserAnswers(game.id, secondPlayerId)

        // const isCorrectAnswer = firstPlayerAnswers.find(item => item.answerStatus === 'Correct')

        // const firstPlayerAnswerTime = new Date(firstPlayerAnswers[0].addedAt)
        // const secondPlayerAnswerTime = new Date(secondPlayerAnswers[0].addedAt)
        

        // if (isCorrectAnswer && firstPlayerAnswers.length === 5 && firstPlayerAnswerTime < secondPlayerAnswerTime) {
            // const game = await this.quizQueryRepository.findMyCurrentGameFullByUserId(firstPlayerId)
            // game![firstPlayerPrefix + 'PlayerScore'] = game![firstPlayerPrefix + 'PlayerScore'] + 1
            // const score = await this.quizQueryRepository.findPlayerScoreByUserId(game.id, firstPlayerId)
            // if (score) {
            //     score.score = score.score + 1
            //     await this.quizRepository.saveScore(score)
            // }

            // await this.quizRepository.saveGame(game!)
        // }
    }
}