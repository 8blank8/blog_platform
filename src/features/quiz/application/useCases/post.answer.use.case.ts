import { CommandHandler } from "@nestjs/cqrs";
import { QuizAnswerModel } from "../../models/quiz.answer.model";
import { UserQueryRepositoryTypeorm } from "src/features/user/infrastructure/typeorm/user.query.repository.typeorm";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { QuizRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.repository.typeorm";
import { QuizResponse } from "../../domain/typeorm/quiz.response.entity";


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

        const playerAnwers = await this.quizQueryRepository.findCountAnswersGameByUserId(quizGame.id, user.id)

        const question = await this.quizQueryRepository.findQuestById(quizGame.questions[playerAnwers === 0 ? 0 : playerAnwers - 1])
        if (!question) return false

        const correctAnswer = question.correctAnswers.find(item => item === inputData.answer)


        const answer = new QuizResponse()
        answer.user = user
        answer.quizGame = quizGame
        answer.question = question
        answer.answerStatus = correctAnswer ? 'Correct' : 'Incorrect'

        const playerScore = await this.quizQueryRepository.findScoreQuizGameByUserId(quizGame.id, user.id)
        if (!playerScore) return false
        if (answer.answerStatus === 'Correct') playerScore.score = playerScore.score + 1

        quizGame.

        await this.quizRepository.savePlayerScore(playerScore)
        await this.quizRepository.saveAnswer(answer)
        // TODO: сделать проверку ответили ли пользователи на все вопросы если да то завершить игру 
        // TODO: сделать проверку ответил ли пользователь быстрее другого и начислить доп бал если есть правильный ответ
        // TODO: связать таблицу с счетом с игрой и в репозитории сделать джоин счета для пользователей

        return {
            questionId: answer.question.id,
            answerStatus: answer.answerStatus,
            addedAt: answer.addedAt
        }
    }
}