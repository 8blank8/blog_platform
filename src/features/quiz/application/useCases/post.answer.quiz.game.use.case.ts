import { CommandHandler } from "@nestjs/cqrs";
import { AnswerCreateModel } from "../../models/create.answer.model";
import { UserQueryRepositoryTypeorm } from "../../../../features/user/infrastructure/typeorm/user.query.repository.typeorm";
import { QuizResponse } from "../../domain/typeorm/quiz.response.entity";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { QuizRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.repository.typeorm";
import { QuizPlayerScore } from "../../domain/typeorm/quiz.player.score.entity";
import { ForbiddenException } from "@nestjs/common";


export class PostAnswerQuizGameCommand {
    constructor(
        public inputData: AnswerCreateModel,
        public userId: string
    ) { }
}

@CommandHandler(PostAnswerQuizGameCommand)
export class PostAnswerQuizGameUseCase {
    constructor(
        private userQueryrepository: UserQueryRepositoryTypeorm,
        private quizQueryRepository: QuizQueryRepositoryTypeorm,
        private quizRepository: QuizRepositoryTypeorm
    ) { }

    async execute(command: PostAnswerQuizGameCommand) {

        const { inputData, userId } = command

        const user = await this.userQueryrepository.findUserByIdForSa(userId)
        if (!user) return false

        const game = await this.quizQueryRepository.findFullActiveGameByUserId(user.id)
        if (!game) throw new ForbiddenException()
        if (game.status === 'PendingSecondPlayer') throw new ForbiddenException()

        let secondPlayerId: string
        if (game.firstPlayer.id !== user.id) {
            secondPlayerId = game.firstPlayer.id
        } else {
            secondPlayerId = game.secondPlayer.id
        }
        const secondPlayerAnswers = await this.quizQueryRepository.findAnswersUser(secondPlayerId, game.id)
        const firstPlayerAnswers = await this.quizQueryRepository.findAnswersUser(user.id, game.id)
        const currentQuest = game.questions[firstPlayerAnswers.length === 0 ? 0 : firstPlayerAnswers.length - 1]

        if (firstPlayerAnswers.length === 5) throw new ForbiddenException()

        const answerStatus = currentQuest.correctAnswers.find(answer => answer === inputData.answer)

        const answer = new QuizResponse()
        answer.user = user
        answer.userId = user.id
        answer.answerStatus = answerStatus ? "Correct" : "Incorrect"
        answer.addedAt = new Date().toISOString()
        answer.question = currentQuest
        answer.questionId = currentQuest.id
        answer.quizGame = game

        const score = await this.quizQueryRepository.findScoreUserByUserId(user.id, game.id)
        if (score && answerStatus) {
            score.score = score.score + 1
            await this.quizRepository.savePlayerScore(score)
        }

        if (!score) {
            const createdScore = new QuizPlayerScore()
            createdScore.user = user
            createdScore.userId = user.id
            createdScore.quizGame = game
            createdScore.score = answerStatus ? 1 : 0

            await this.quizRepository.savePlayerScore(createdScore)
        }

        await this.quizRepository.saveAnswer(answer)

        if ((firstPlayerAnswers.length + secondPlayerAnswers.length + 1) === 10) {
            game.finishGameDate = new Date().toISOString()
            await this.quizRepository.saveQuizGame(game)

            const oneCorrectAnswerFirstPlayer = firstPlayerAnswers.find(answer => answer.answerStatus === 'Correct')
            const oneCorrectAnswerSecondPlayer = secondPlayerAnswers.find(answer => answer.answerStatus === 'Correct')

            if (firstPlayerAnswers[0].addedAt < secondPlayerAnswers[0].addedAt && oneCorrectAnswerFirstPlayer) {
                const score = await this.quizQueryRepository.findScoreUserByUserId(user.id, game.id)
                score!.score = score!.score + 1
                await this.quizRepository.savePlayerScore(score!)
            }

            if (secondPlayerAnswers[0].addedAt < firstPlayerAnswers[0].addedAt && oneCorrectAnswerSecondPlayer) {
                const score = await this.quizQueryRepository.findScoreUserByUserId(secondPlayerId, game.id)
                score!.score = score!.score + 1
                await this.quizRepository.savePlayerScore(score!)
            }
        }

        return answer.id
    }
}