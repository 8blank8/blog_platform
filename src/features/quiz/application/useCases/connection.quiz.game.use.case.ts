import { CommandHandler } from "@nestjs/cqrs";
import { QuizGameModel } from "../../models/quiz.game.model";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { UserQueryRepositoryTypeorm } from "src/features/user/infrastructure/typeorm/user.query.repository.typeorm";
import { QuizRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.repository.typeorm";
import { QuizGame } from "../../domain/typeorm/quiz.game.entity";


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
        private quizRepository: QuizRepositoryTypeorm,
        private userQueryRepository: UserQueryRepositoryTypeorm
    ) { }

    async execute(command: ConnectionQuizGameCommand)
    // : Promise<QuizGameModel | false> 
    {

        const { userId } = command

        const user = await this.userQueryRepository.findUserByIdForSa(userId)
        if (!user) return false

        const pendingGame = await this.quizQueryRepository.findPendingGame()
        if (pendingGame) {
            const randomQuestion = await this.quizQueryRepository.getFiveRandomQuestion()

            pendingGame.secondPlayer = user
            pendingGame.pairCreatedDate = new Date().toISOString()
            pendingGame.startGameDate = new Date().toISOString()
            pendingGame.status = 'Active'
            pendingGame.questions = randomQuestion

            await this.quizRepository.saveQuizGame(pendingGame)

            return pendingGame
            // TODO: сохранить данные

        }

        const newGame = new QuizGame()
        newGame.status = 'PendingSecondPlayer'
        newGame.firstPlayer = user

        await this.quizRepository.saveQuizGame(newGame)
        return newGame
        // TODO: доделать логику создания игры 
    }
}