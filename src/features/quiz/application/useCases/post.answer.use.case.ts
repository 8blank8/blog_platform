import { CommandHandler } from "@nestjs/cqrs";
import { QuizAnswerModel } from "../../models/quiz.answer.model";
import { UserQueryRepositoryTypeorm } from "src/features/user/infrastructure/typeorm/user.query.repository.typeorm";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { QuizRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.repository.typeorm";
import { QuizResponse } from "../../domain/typeorm/quiz.response.entity";
import { QuizGame } from "../../domain/typeorm/quiz.game.entity";
import { QuizQestion } from "../../domain/typeorm/question.entity";
import { QuizPlayerScore } from "../../domain/typeorm/quiz.player.score.entity";
import { Users } from "src/features/user/domain/typeorm/user.entity";


export class PostAnswerCommand {
    constructor(
        public userId: string,
        public inputData: QuizAnswerModel
    ) { }
}

@CommandHandler(PostAnswerCommand)
export class PostAnswerUseCase {
    constructor(
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private quizQueryRepository: QuizQueryRepositoryTypeorm,
        private quizRepository: QuizRepositoryTypeorm
    ) { }

    async execute(command: PostAnswerCommand) {

        const { userId, inputData } = command

        const user = await this.userQueryRepository.findUserByIdForSa(userId)
        if (!user) return false

        const quizGame = await this.quizQueryRepository.findActiveQuizGameByUserId(userId)
        if (!quizGame) return false

        const secondPlayerId = this.findSecondUser(quizGame, user.id)

        const firstPlayerAnwers = await this.quizQueryRepository.findAnswersGameByUserId(quizGame.id, user.id)
        const secondPlayerAnswers = await this.quizQueryRepository.findAnswersGameByUserId(quizGame.id, secondPlayerId)

        const answerData = await this.checkCorrectAnswer(inputData.answer, quizGame, firstPlayerAnwers.length)

        const answer = new QuizResponse()
        answer.user = user
        answer.quizGame = quizGame
        answer.question = answerData.question
        answer.answerStatus = answerData.answerStatus

        await this.updateScorePlayer(quizGame, user, answerData.answerStatus)


        const isCorrectAnswer = firstPlayerAnwers.find(answer => answer.answerStatus === 'Correct')
        if (firstPlayerAnwers.length === 5 && firstPlayerAnwers.length > secondPlayerAnswers.length && isCorrectAnswer) {
            await this.updateScorePlayer(quizGame, user, 'Correct')
        }

        if (firstPlayerAnwers.length === 5 && secondPlayerAnswers.length === 5) {
            quizGame.finishGameDate = new Date().toISOString()
            await this.quizRepository.saveQuizGame(quizGame)
        }

        await this.quizRepository.saveAnswer(answer)
        // TODO: сделать отображение пользователя в счете

        return {
            questionId: answer.question.id,
            answerStatus: answer.answerStatus,
            addedAt: answer.addedAt
        }
    }

    findSecondUser(quizGame: QuizGame, userId: string): string {
        if (quizGame.firstPlayer.id !== userId) return quizGame.firstPlayer.id
        return quizGame.secondPlayer.id
    }

    async checkCorrectAnswer(answer: string, quizGame: QuizGame, answerCount: number): Promise<{ question: QuizQestion, answerStatus: 'Correct' | 'Incorrect' }> {
        const question = await this.quizQueryRepository.findQuestById(quizGame.questions[answerCount === 0 ? 0 : answerCount - 1])
        console.log(quizGame.questions[answerCount === 0 ? 0 : answerCount - 1], 'questId')
        console.log(quizGame.questions, 'question')
        console.log(answerCount, 'count')
        const correctAnswer = question!.correctAnswers.find(item => item === answer)

        return {
            question: question!,
            answerStatus: correctAnswer ? 'Correct' : 'Incorrect'
        }
    }

    async updateScorePlayer(quizGame: QuizGame, user: Users, answerStatus: string) {
        const playerScore = await this.quizQueryRepository.findScoreQuizGameByUserId(quizGame.id, user.id)
        if (!playerScore) {
            const createdPlayerScore = new QuizPlayerScore()
            createdPlayerScore.quizGame = quizGame
            createdPlayerScore.user = user
            createdPlayerScore.score = answerStatus === 'Correct' ? 1 : 0

            await this.quizRepository.savePlayerScore(createdPlayerScore)
            return true
        }

        if (answerStatus === 'Correct') playerScore.score = playerScore.score + 1

        await this.quizRepository.savePlayerScore(playerScore)
        return true
    }

}