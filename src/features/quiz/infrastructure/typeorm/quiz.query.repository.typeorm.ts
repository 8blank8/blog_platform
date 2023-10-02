import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuizQestion } from "../../domain/typeorm/question.entity";
import { Repository } from "typeorm";
import { QuestionQueryParam } from "../../models/question.query.param";
import { QuestPagniation } from "src/entity/pagination/quest/quest.pagination";
import { QuizGame } from "../../domain/typeorm/quiz.game.entity";
import { QuizResponse } from "../../domain/typeorm/quiz.response.entity";
import { QuizPlayerScore } from "../../domain/typeorm/quiz.player.score.entity";


@Injectable()
export class QuizQueryRepositoryTypeorm {
    constructor(
        @InjectRepository(QuizQestion) private questRepo: Repository<QuizQestion>,
        @InjectRepository(QuizGame) private quizGameRepo: Repository<QuizGame>,
        @InjectRepository(QuizResponse) private quizResponseRepo: Repository<QuizResponse>,
        @InjectRepository(QuizPlayerScore) private quizPlayerScoreRepo: Repository<QuizPlayerScore>
    ) { }

    async findQuestById(questId: string): Promise<QuizQestion | null> {
        return this.questRepo.createQueryBuilder('q')
            .where('q.id = :questId', { questId })
            .getOne()
    }

    async findAllQuestion(queryParam: QuestionQueryParam) {

        const pagination = new QuestPagniation(queryParam).getQuestPaginationForSql()
        let { bodySearchTerm, publishedStatus, sortBy, sortDirection, pageNumber, pageSize, offset } = pagination

        const queryBuilder = this.questRepo.createQueryBuilder('q')
            .where('q.body ILIKE :bodySearchTerm', { bodySearchTerm })
            .orderBy(`"${sortBy}" ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'}`, sortDirection)
            .offset(offset)
            .limit(pageSize)

        if (publishedStatus !== null) {
            queryBuilder.andWhere('q.published = :publishedStatus', { publishedStatus: publishedStatus ?? null })
        }

        const questions = await queryBuilder.getMany()

        const totalCount = await this.questRepo.createQueryBuilder('qs')
            .where('qs.body ILIKE :bodySearchTerm', { bodySearchTerm })
            .andWhere('qs.published = :publishedStatus', { publishedStatus })
            .getCount()

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: questions
        }
    }

    async getFiveRandomQuestion(): Promise<string[]> {
        const randomQuestion = await this.questRepo.createQueryBuilder('q')
            .where('q.published = true')
            .orderBy("RANDOM()")
            .limit(5)
            .getMany()

        return randomQuestion.map(quest => quest.id)
    }

    async findPendingGame(): Promise<QuizGame | null> {
        return this.quizGameRepo.createQueryBuilder('q')
            .where(`q.status = 'PendingSecondPlayer'`)
            .getOne()
    }

    async findQuizGameById(gameId: string): Promise<QuizGame | null> {
        return this.quizGameRepo.createQueryBuilder('q')
            .where('q.id = :gameId', { gameId })
            .leftJoinAndSelect('q.firstPlayer', 'fp')
            .leftJoinAndSelect('q.secondPlayer', 'sp')
            .leftJoinAndSelect('q.score', 'se')
            .getOne()

    }

    async findActiveQuizGameByUserId(userId: string): Promise<QuizGame | null> {
        return this.quizGameRepo.createQueryBuilder('q')
            .where(`q."firstPlayerId" = :userId OR q."secondPlayerId" = :userId`, { userId })
            .andWhere(`q.finishGameDate is null`)
            .andWhere(`q.status = 'Active'`)
            .leftJoinAndSelect('q.firstPlayer', 'fp')
            .leftJoinAndSelect('q.secondPlayer', 'sp')
            .leftJoinAndSelect('q.score', 'se')
            .getOne()
    }

    async findAnswersGameByUserId(gameId: string, userId: string): Promise<QuizResponse[]> {
        return this.quizResponseRepo.createQueryBuilder('q')
            .where('q."quizGameId" = :gameId', { gameId })
            .andWhere('q.user = :userId', { userId })
            .getMany()
    }

    async updateScoreQuizGameByUserId(gameId: string, userId: string, score: number) {
        return this.quizPlayerScoreRepo.createQueryBuilder()
            .update(QuizPlayerScore)
            .set({ score: score })
            .where(`"userId" = :userId`, { userId })
            .andWhere(`"quizGameId" = :gameId`, { gameId })
    }

    async findScoreQuizGameByUserId(gameId: string, userId: string): Promise<QuizPlayerScore | null> {
        return this.quizPlayerScoreRepo.createQueryBuilder(`q`)
            .where(`q."userId" = :userId`, { userId })
            .andWhere(`q."quizGameId" = :gameId`, { gameId })
            .getOne()
    }

}