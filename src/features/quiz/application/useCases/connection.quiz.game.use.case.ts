import { CommandHandler } from "@nestjs/cqrs";
import { QuizGameModel } from "../../models/quiz.game.model";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { UserQueryRepositoryTypeorm } from "../../../../features/user/infrastructure/typeorm/user.query.repository.typeorm";
import { QuizGame } from "../../domain/typeorm/quiz.game.entity";
import { QuizRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.repository.typeorm";
import { ForbiddenException } from "@nestjs/common";


export class ConnectionQuizGameCommand {
    constructor(
        public userId: string
    ) { }
}

@CommandHandler(ConnectionQuizGameCommand)
// TODO: добавить useCase в app.module.ts
export class ConnectionQuizGameUseCase {
    constructor(
        private quizQueryRepository: QuizQueryRepositoryTypeorm,
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private quizRepository: QuizRepositoryTypeorm
    ) { }

    async execute(command: ConnectionQuizGameCommand)
    // : Promise<QuizGameModel | false> 
    {

        const { userId } = command

        const user = await this.userQueryRepository.findUserByIdForSa(userId)
        if (!user) return false

        const activeGameUser = await this.quizQueryRepository.findMyActiveGame(user.id)
        if (activeGameUser) throw new ForbiddenException()

        const pendingGame = await this.quizQueryRepository.findPendingGame()
        if (pendingGame) {
            const randomQuestion = await this.quizQueryRepository.getFiveRandomQuestion()

            pendingGame.secondPlayer = user
            pendingGame.startGameDate = new Date().toISOString()
            pendingGame.status = 'Active'
            pendingGame.questions = randomQuestion

            await this.quizRepository.saveQuizGame(pendingGame)

            return pendingGame.id
        }

        const game = new QuizGame()
        game.firstPlayer = user
        game.pairCreatedDate = new Date().toISOString()
        game.status = 'PendingSecondPlayer'

        await this.quizRepository.saveQuizGame(game)

        return game.id
        // TODO: доделать логику создания игры 
    }
}