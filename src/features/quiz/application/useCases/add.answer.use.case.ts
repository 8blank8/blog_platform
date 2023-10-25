import { CommandHandler } from "@nestjs/cqrs";
import { AnswerCreateModel } from "../../models/create.answer.model";
import { UserQueryRepositoryTypeorm } from "../../../user/infrastructure/typeorm/user.query.repository.typeorm";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { ForbiddenException } from "@nestjs/common";
import { Answer } from "../../domain/typeorm/answer.entity";
import { QuizRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.repository.typeorm";


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

        let firstPlayerPrefix: string
        let secondPlayerPrefix: string
        let secondPlayerId: string
        if (game.firstPlayer.id === user.id) {
            firstPlayerPrefix = 'first'
            secondPlayerPrefix = 'second'
            secondPlayerId = game.secondPlayer.id
        } else {
            firstPlayerPrefix = 'second'
            secondPlayerId = game.firstPlayer.id
            secondPlayerPrefix = 'first'
        }

        const firstPlayerAnswersCount = game.answer.filter(answer => answer.userId === user.id).length
        const secondPlayerAnswersCount = game.answer.filter(answer => answer.userId === secondPlayerId).length
        // const firstPlayerAnswersCount = (await this.quizQueryRepository.findUserAnswers(game.id, user.id)).length
        // const firstPlayerAnswersCount = firstPlayerAnswers.length
        if (firstPlayerAnswersCount === 5) throw new ForbiddenException()
        // console.log({
        //     firstPlayerAnswersCount: firstPlayerAnswersCount,
        //     questId: game.questions[firstPlayerAnswersCount],
        //     userId: user.id,
        //     questions: game.questions.map(item => ({questId: item.id}))
        // })
        const createdAnswer = new Answer()
        createdAnswer.game = game
        createdAnswer.user = user
        createdAnswer.userId = user.id
        createdAnswer.question = game.questions[firstPlayerAnswersCount]
        createdAnswer.questionId = game.questions[firstPlayerAnswersCount].id

        const answer = game.questions[firstPlayerAnswersCount].correctAnswers.find(item => item === inputData.answer)

        if (answer) {
            createdAnswer.answerStatus = 'Correct'
            game[firstPlayerPrefix + 'PlayerScore'] = game[firstPlayerPrefix + 'PlayerScore'] + 1
        } else {
            createdAnswer.answerStatus = 'Incorrect'
        }

        await this.quizRepository.saveGame(game)
        await this.quizRepository.saveAnswer(createdAnswer)

        if(firstPlayerAnswersCount && secondPlayerAnswersCount){
            await this.checkAddBonus(game.id, user.id, secondPlayerId, firstPlayerPrefix)
        }

        const isFinished = await this.checkFinishGame(user.id)
        if (isFinished) {
            game.finishGameDate = new Date().toISOString()
            game.status = 'Finished'
            await this.quizRepository.saveGame(game)
        }

        return createdAnswer.id
    }

    private async checkFinishGame(userId: string) {
        const game = await this.quizQueryRepository.findMyCurrentGameFullByUserId(userId)
        if (!game) return false

        return game.answer.length === 10 ? true : false
    }

    private async checkAddBonus(gameId: string, firstPlayerId: string, secondPlayerId: string, firstPlayerPrefix: string) {
        const firstPlayerAnswers = await this.quizQueryRepository.findUserAnswers(gameId, firstPlayerId)
        const secondPlayerAnswers = await this.quizQueryRepository.findUserAnswers(gameId, secondPlayerId)

        const isCorrectAnswer = firstPlayerAnswers.find(item => item.answerStatus === 'Correct')

        const firstPlayerAnswerTime = new Date(firstPlayerAnswers[0].addedAt)
        const secondPlayerAnswerTime = new Date(secondPlayerAnswers[0].addedAt)

        if (isCorrectAnswer && firstPlayerAnswers.length === 5 && firstPlayerAnswerTime < secondPlayerAnswerTime) {
            const game = await this.quizQueryRepository.findMyCurrentGameFullByUserId(firstPlayerId)
            game![firstPlayerPrefix + 'PlayerScore'] = game![firstPlayerPrefix + 'PlayerScore'] + 1

            await this.quizRepository.saveGame(game!)
        }
    }
}