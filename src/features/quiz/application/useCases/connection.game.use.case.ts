import { CommandHandler } from "@nestjs/cqrs";
import { UserQueryRepositoryTypeorm } from "../../../user/infrastructure/typeorm/user.query.repository.typeorm";
import { QuizQueryRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.query.repository.typeorm";
import { ForbiddenException } from "@nestjs/common";
import { Game } from "../../domain/typeorm/quiz.game";
import { QuizRepositoryTypeorm } from "../../infrastructure/typeorm/quiz.repository.typeorm";


export class ConnectionGameCommand {
    constructor(
        public userId: string
    ){}
}

@CommandHandler(ConnectionGameCommand)
export class ConnectionGameUseCase {
    constructor(
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private quizQueryRepository: QuizQueryRepositoryTypeorm,
        private quizRepository: QuizRepositoryTypeorm
    ){}

    async execute(command: ConnectionGameCommand): Promise<string | boolean>{

        const {userId} = command

        const user = await this.userQueryRepository.findUserByIdForSa(userId)
        if(!user) return false

        const activeGame = await this.quizQueryRepository.findActiveGameByUserId(userId)
        if(activeGame) throw new ForbiddenException()

        const pendingGame = await this.quizQueryRepository.findPendingGame()

        if(!pendingGame){

            const game = new Game()

            game.firstPlayer = user
            game.pairCreatedDate = new Date().toISOString()
            game.status ='PendingSecondPlayer'

            await this.quizRepository.saveGame(game)
            return game.id
        }  

        const randomQuestion = await this.quizQueryRepository.getFiveRandomQuestion()
        
        pendingGame.secondPlayer = user
        pendingGame.startGameDate = new Date().toISOString()
        pendingGame.status = 'Active'
        pendingGame.questions = randomQuestion

        await this.quizRepository.saveGame(pendingGame)

        return pendingGame.id
    }
}