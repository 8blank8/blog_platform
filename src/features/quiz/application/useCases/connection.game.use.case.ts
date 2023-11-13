import { CommandHandler } from "@nestjs/cqrs";
import { UserQueryRepositoryTypeorm } from "../../../user/infrastructure/typeorm/user.query.repository.typeorm";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { ForbiddenException } from "@nestjs/common";
import { Game } from "../../domain/typeorm/quiz.game";
import { QuizRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.repository.typeorm";
import { QuizScore } from "../../domain/typeorm/quiz.score.entity";
import { QuizPlayer } from "../../domain/typeorm/quiz.player.entity";


export class ConnectionGameCommand {
    constructor(
        public userId: string
    ) { }
}

@CommandHandler(ConnectionGameCommand)
export class ConnectionGameUseCase {
    constructor(
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private quizQueryRepository: QuizQueryRepositoryTypeorm,
        private quizRepository: QuizRepositoryTypeorm
    ) { }

    async execute(command: ConnectionGameCommand): Promise<string | boolean> {

        const { userId } = command

        const user = await this.userQueryRepository.findUserByIdForSa(userId)
        if (!user) return false

        let player = await this.quizQueryRepository.findPlayerById(user.id)

        if (player) {
            player.gamesCount += 1
            await this.quizRepository.savePlayer(player)
        }

        if (!player) {
            player = new QuizPlayer()
            player.userId = user.id
            player.user = user
            player.gamesCount = 1
            await this.quizRepository.savePlayer(player)
        }


        const activeGame = await this.quizQueryRepository.findMyCurrentGameFullByUserId(player.id)
        if (activeGame) throw new ForbiddenException()

        const pendingGame = await this.quizQueryRepository.findPendingGame()

        const score = new QuizScore()

        if (!pendingGame) {

            const game = new Game()

            game.firstPlayer = player
            game.pairCreatedDate = new Date().toISOString()
            game.status = 'PendingSecondPlayer'

            await this.quizRepository.saveGame(game)

            score.user = player
            score.userId = player.id
            score.game = game

            await this.quizRepository.saveScore(score)
            return game.id
        }

        const randomQuestion = await this.quizQueryRepository.getFiveRandomQuestion()

        pendingGame.secondPlayer = player
        pendingGame.startGameDate = new Date().toISOString()
        pendingGame.status = 'Active'
        pendingGame.questions = randomQuestion

        await this.quizRepository.saveGame(pendingGame)

        score.user = player
        score.userId = player.id
        score.game = pendingGame

        await this.quizRepository.saveScore(score)

        return pendingGame.id
    }
}