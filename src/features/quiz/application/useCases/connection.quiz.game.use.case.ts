import { CommandHandler } from "@nestjs/cqrs";
import { QuizGameModel } from "../../models/quiz.game.model";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { UserQueryRepositoryTypeorm } from "src/features/user/infrastructure/typeorm/user.query.repository.typeorm";


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
            // TODO: сохранить данные

        }
        // TODO: доделать логику создания игры 
    }
}