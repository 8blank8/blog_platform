import { Controller, Post, Req, UseGuards } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "src/features/auth/guards/jwt.guard";
import { ConnectionQuizGameCommand } from "../../application/useCases/connection.quiz.game.use.case";


@Controller('pair-game-quiz/pairs')
export class QuizPublicController {
    constructor(
        private commandBus: CommandBus
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('/connection')
    async connectionGame(
        @Req() req
    ) {
        const userId = req.user

        const game = await this.commandBus.execute(new ConnectionQuizGameCommand(userId))

        return game
    }

}