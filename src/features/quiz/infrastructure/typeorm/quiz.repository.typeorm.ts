import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuizQestion } from "../../domain/typeorm/question.entity";
import { Repository } from "typeorm";
import { Game } from "../../domain/typeorm/quiz.game";
import { Answer } from "../../domain/typeorm/answer.entity";
import { QuizScore } from "../../domain/typeorm/quiz.score.entity";
import { log } from "console";
import { QuizPlayer } from "../../domain/typeorm/quiz.player.entity";


@Injectable()
export class QuizRepositoryTypeorm {
    constructor(
        @InjectRepository(QuizQestion) private questRepo: Repository<QuizQestion>,
        @InjectRepository(Game) private gameRepo: Repository<Game>,
        @InjectRepository(Answer) private answerRepo: Repository<Answer>,
        @InjectRepository(QuizScore) private scoreRepo: Repository<QuizScore>,
        @InjectRepository(QuizPlayer) private playerRepo: Repository<QuizPlayer>,
    ) { }

    async saveQuest(quest: QuizQestion) {
        return this.questRepo.save(quest)
    }

    async deleteQuest(questId: string) {
        return this.questRepo.delete({ id: questId })
    }

    async saveGame(game: Game) {
        return this.gameRepo.save(game)
    }

    async saveAnswer(answer: Answer) {
        // log(answer, 'IN REPO')
        return this.answerRepo.save(answer)
    }

    async saveScore(score: QuizScore) {
        return this.scoreRepo.save(score)
    }

    async savePlayer(player: QuizPlayer){
        return this.playerRepo.save(player)
    }
}