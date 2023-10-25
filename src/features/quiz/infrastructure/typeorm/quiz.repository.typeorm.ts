import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuizQestion } from "../../domain/typeorm/question.entity";
import { Repository } from "typeorm";
import { Game } from "../../domain/typeorm/quiz.game";
import { Answer } from "../../domain/typeorm/answer.entity";


@Injectable()
export class QuizRepositoryTypeorm {
    constructor(
        @InjectRepository(QuizQestion) private questRepo: Repository<QuizQestion>,
        @InjectRepository(Game) private gameRepo: Repository<Game>,
        @InjectRepository(Answer) private answerRepo: Repository<Answer>,
    ) { }

    async saveQuest(quest: QuizQestion) {
        return this.questRepo.save(quest)
    }

    async deleteQuest(questId: string) {
        return this.questRepo.delete({ id: questId })
    }

    async saveGame(game: Game){
        return this.gameRepo.save(game)
    }

    async saveAnswer(answer: Answer){
        return this.answerRepo.save(answer)
    }
}