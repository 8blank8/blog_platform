import { CommandHandler } from "@nestjs/cqrs";
import { AnswerCreateModel } from "../../models/create.answer.model";
import { UserQueryRepositoryTypeorm } from "../../../user/infrastructure/typeorm/user.query.repository.typeorm";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { ForbiddenException } from "@nestjs/common";
import { Answer } from "../../domain/typeorm/answer.entity";
import { QuizRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.repository.typeorm";
import { log } from "console";
import { QuizScore } from "../../domain/typeorm/quiz.score.entity";
import { QuizPlayer } from "../../domain/typeorm/quiz.player.entity";
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

        const player = await this.quizQueryRepository.findPlayerById(userId)
        if (!player) throw new ForbiddenException()

        const game = await this.quizQueryRepository.findMyCurrentGameFullByUserId(player.id)
        if (!game) throw new ForbiddenException()
        if (!game.secondPlayer) throw new ForbiddenException()

        const firstPlayerAnswersCount = !game.answer ? 0 : game.answer.filter(answer => answer.userId === player.id).length
        if (firstPlayerAnswersCount === 5) throw new ForbiddenException()

        let secondPlayerId: string
        if (game.firstPlayer.id === player.id) {
            secondPlayerId = game.secondPlayer.id
        } else {
            secondPlayerId = game.firstPlayer.id
        }

        if (firstPlayerAnswersCount === 4) {
            game.answerTime = new Date()
        }

        console.log({ time: game.answerTime, date: new Date() })

        if (game.answerTime < new Date()) {
            let answerId: string = ''
            for (let i = firstPlayerAnswersCount; i <= 4; i++) {
                const createdAnswer = new Answer()
                createdAnswer.gameId = game.id
                createdAnswer.user = player
                createdAnswer.userId = player.id
                createdAnswer.question = game.questions[firstPlayerAnswersCount]
                createdAnswer.questionId = game.questions[firstPlayerAnswersCount].id
                createdAnswer.addedAt = new Date().toISOString()
                createdAnswer.answerStatus = 'Incorrect'

                let gameAnswers
                if (game.answer) {
                    gameAnswers = [...game.answer, createdAnswer]
                } else {
                    gameAnswers = [createdAnswer]
                }

                game.answer = gameAnswers

                await this.quizRepository.saveGame(game)
                await this.quizRepository.saveAnswer(createdAnswer)
                answerId = createdAnswer.id
            }

            const isFinished = await this.checkFinishGame(player.id)
            if (isFinished) {
                game.finishGameDate = new Date().toISOString()
                game.status = 'Finished'
                await this.quizRepository.saveGame(game)
            }

            return answerId
        }

        const createdAnswer = new Answer()
        createdAnswer.gameId = game.id
        createdAnswer.user = player
        createdAnswer.userId = player.id
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


        const score = await this.quizQueryRepository.findPlayerScoreByUserId(game.id, player.id)

        if (score && answer) {
            score.score = score.score + 1
            player.sumScore += 1

            await this.quizRepository.savePlayer(player)
            await this.quizRepository.saveScore(score)
        }


        const isFinished = await this.checkFinishGame(player.id)
        if (isFinished) {
            game.finishGameDate = new Date().toISOString()
            game.status = 'Finished'
            await this.quizRepository.saveGame(game)
        }


        await this.checkAddBonus(game.id, player.id, secondPlayerId)
        // console.log(createdAnswer, 'IN UC FOR RETURN')
        return createdAnswer.id
    }

    // private checkExpirationGame(game: Game, player: QuizPlayer) {
    //     const time = new Date()

    //     if(time > game.answerTime){

    //     }
    // }

    private async checkFinishGame(userId: string) {
        const game = await this.quizQueryRepository.findMyCurrentGameFullByUserId(userId)
        if (!game) return false
        return game.answer.length === 10 ? true : false
    }

    private async checkAddBonus(gameId: string, firstPlayerId: string, secondPlayerId: string) {

        const game = await this.quizQueryRepository.findFullGameByGameId(gameId)
        if (!game || game.status !== "Finished") return false

        const firstPlayer = await this.quizQueryRepository.findPlayerByPlayerId(firstPlayerId)
        const secondPlayer = await this.quizQueryRepository.findPlayerByPlayerId(secondPlayerId)
        if (!firstPlayer || !secondPlayer) return false

        // firstPlayer.sumScore += game.score.find(item => item.user.id === firstPlayer.id)!.score
        // secondPlayer.sumScore += game.score.find(item => item.user.id === secondPlayer.id)!.score

        let playerId: string = firstPlayerId
        let firstPlayerAnswer: any = []
        let secondPlayerAnswer: any = []
        let firstPlayerCorrectAnswer = []
        let secondPlayerCorrectAnser = []

        game.answer.forEach(item => {
            if (item.userId === game.firstPlayer.id) {
                firstPlayerAnswer.push(item)
            } else {
                secondPlayerAnswer.push(item)
            }
        })

        firstPlayerAnswer.sort((a, b) => a.addedAt < b.addedAt)
        secondPlayerAnswer.sort((a, b) => a.addedAt < b.addedAt)

        firstPlayerCorrectAnswer = firstPlayerAnswer.filter(item => item.answerStatus === 'Correct')
        secondPlayerCorrectAnser = secondPlayerAnswer.filter(item => item.answerStatus === 'Correct')

        if (firstPlayerCorrectAnswer.length === 0 && secondPlayerCorrectAnser.length === 0) return false

        if (firstPlayerAnswer[0].addedAt > secondPlayerAnswer[0].addedAt && firstPlayerCorrectAnswer.length !== 0) {

            const score = await this.quizQueryRepository.findPlayerScoreByUserId(game.id, firstPlayerId)
            if (!score) return false

            score.score = score.score + 1
            firstPlayer.sumScore += 1

            await this.quizRepository.saveScore(score)
        }
        if (secondPlayerAnswer[0].addedAt > firstPlayerAnswer[0].addedAt && secondPlayerCorrectAnser.length !== 0) {
            const score = await this.quizQueryRepository.findPlayerScoreByUserId(game.id, secondPlayerId)
            if (!score) return false

            score.score = score.score + 1
            secondPlayer.sumScore += 1

            await this.quizRepository.saveScore(score)
        }

        const game1 = await this.quizQueryRepository.findFullGameByGameId(game.id)
        if (!game1) return false

        let firstPlayerScore
        let secondPlayerScore

        game1.score.forEach(item => {
            if (item.userId === firstPlayer.id) {
                firstPlayerScore = item
            } else {
                secondPlayerScore = item
            }
        })

        if (firstPlayerScore.score === secondPlayerScore.score) {
            firstPlayer.drawsCount += 1
            secondPlayer.drawsCount += 1


            await this.quizRepository.savePlayer(firstPlayer)
            await this.quizRepository.savePlayer(secondPlayer)
            console.log({ draw: 'its draw' })
            return true
        }

        if (firstPlayerScore.score > secondPlayerScore.score) {
            firstPlayer.winsCount += 1
            secondPlayer.lossesCount += 1
        } else {
            secondPlayer.winsCount += 1
            firstPlayer.lossesCount += 1
        }

        firstPlayer.avgScores = Math.round((firstPlayer.sumScore / firstPlayer.gamesCount) * 100) / 100;;
        secondPlayer.avgScores = Math.round((secondPlayer.sumScore / secondPlayer.gamesCount) * 100) / 100;;

        await this.quizRepository.savePlayer(firstPlayer)
        await this.quizRepository.savePlayer(secondPlayer)
    }

}


