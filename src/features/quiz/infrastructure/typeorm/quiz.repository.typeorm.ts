import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuizQestion } from "../../domain/typeorm/question.entity";
import { Repository } from "typeorm";


@Injectable()
export class QuizRepositoryTypeorm {
    constructor(@InjectRepository(QuizQestion) private questRepo: Repository<QuizQestion>) { }

    async saveQuest(quest: QuizQestion) {
        return this.questRepo.save(quest)
    }

    async deleteQuest(questId: string) {
        return this.questRepo.delete({ id: questId })
    }
}