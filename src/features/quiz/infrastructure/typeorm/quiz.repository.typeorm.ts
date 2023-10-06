import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuizQestion } from "../../domain/typeorm/question.entity";
import { Repository } from "typeorm";
import { QuizGame } from "../../domain/typeorm/quiz.game.entity";
import { QuizResponse } from "../../domain/typeorm/quiz.response.entity";
import { QuizPlayerScore } from "../../domain/typeorm/quiz.player.score.entity";


@Injectable()
export class QuizRepositoryTypeorm {
    constructor(
        @InjectRepository(QuizQestion) private questRepo: Repository<QuizQestion>,
        @InjectRepository(QuizGame) private quizGameRepo: Repository<QuizGame>,
        @InjectRepository(QuizResponse) private quizResponseRepo: Repository<QuizResponse>,
        @InjectRepository(QuizPlayerScore) private quizPlayerScoreRepo: Repository<QuizPlayerScore>
    ) { }

    async saveQuest(quest: QuizQestion) {
        return this.questRepo.save(quest)
    }

    async deleteQuest(questId: string) {
        return this.questRepo.delete({ id: questId })
    }

    async saveQuizGame(game: QuizGame) {
        return this.quizGameRepo.save(game)
    }

    async saveAnswer(answer: QuizResponse) {
        return this.quizResponseRepo.save(answer)
    }

    async savePlayerScore(score: QuizPlayerScore) {
        return this.quizPlayerScoreRepo.save(score)
    }
}