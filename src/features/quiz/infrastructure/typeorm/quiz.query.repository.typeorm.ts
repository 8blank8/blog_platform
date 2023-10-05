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

    async getFiveRandomQuestion(): Promise<QuizQestion[]> {
        const randomQuestion = await this.questRepo.createQueryBuilder('q')
            .where('q.published = true')
            .orderBy("RANDOM()")
            .limit(5)
            .getMany()

        return randomQuestion
    }

    async findPendingGame(): Promise<QuizGame | null> {
        return this.quizGameRepo.createQueryBuilder('q')
            .where(`q.status = 'PendingSecondPlayer'`)
            .getOne()
    }

    async findQuizGameById(gameId: string) {

        // const score = await this.quizPlayerScoreRepo.createQueryBuilder('s')
        //     .where(`quizGameId = :gameId`, { gameId })
        //     .getMany()

        // const game = await this.quizGameRepo.createQueryBuilder('q')
        //     .where('q.id = :gameId', { gameId })
        //     .leftJoinAndSelect('q.firstPlayer', 'fp')
        //     .leftJoinAndSelect('q.secondPlayer', 'sp')
        //     .leftJoinAndMapMany('q.score', QuizPlayerScore, 'se')
        //     .getSql()

        // console.log(game)
        const game = await this.quizGameRepo.createQueryBuilder('q')
            .where('q.id = :gameId', { gameId })
            .leftJoinAndSelect('q.firstPlayer', 'fp')
            .leftJoinAndSelect('q.secondPlayer', 'sp')
            .leftJoinAndSelect('q.score', 's')
            .leftJoinAndSelect('q.quizResponse', 'qr')
            .leftJoinAndSelect('q.fullQuestions', 'fq')
            // .leftJoinAndMapOne('q.score', QuizPlayerScore, 'fps', 'fps."quizGameId" = :gameId AND fps."userId" = q.firstPlayer', { gameId })
            // .leftJoinAndMapOne('q.score', QuizPlayerScore, 'sps', 'sps."quizGameId" = :gameId AND sps."userId" = q.secondPlayer', { gameId })
            // .leftJoinAndMapMany('q.quizResponse', QuizResponse, 'fpa', 'fpa."quizGameId" = :gameId AND fpa."userId" = q.firstPlayer', { gameId })
            // .leftJoinAndMapMany('q.quizResponse', QuizResponse, 'spa', 'spa."quizGameId" = :gameId AND spa."userId" = q.secondPlayer', { gameId })
            .getOne()

        console.log(game)
        if (!game) return null

        return this._mapQuizGame(game)

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

    _mapQuizGame(game: QuizGame) {

        const answersFirstplayer = game.quizResponse.filter(item => item.userId === game.firstPlayer.id)
        const answersSecondplayer = game.quizResponse.filter(item => item.userId === game.secondPlayer.id)

        return {
            id: game.id,
            firstPlayerProgress: {
                answers: answersFirstplayer.map(item => ({ questionId: item.questionId, answerStatus: item.answerStatus, addedAt: item.addedAt })),
                player: {
                    id: game.firstPlayer.id,
                    login: game.firstPlayer.login
                },
                score: game.score.filter(item => item.userId === game.firstPlayer.id)[0].score ?? 0
            },
            secondPlayerProgress: {
                answers: answersSecondplayer.map(item => ({ questionId: item.questionId, answerStatus: item.answerStatus, addedAt: item.addedAt })),
                player: {
                    id: game.secondPlayer.id,
                    login: game.secondPlayer.login
                },
                score: game.score.filter(item => item.userId === game.secondPlayer.id)[0].score ?? 0
            },
            questions: game.fullQuestions.map(quest => ({ id: quest.id, body: quest.body })),
            status: game.status,
            pairCreatedDate: game.pairCreatedDate,
            startGameDate: game.startGameDate,
            finishGameDate: game.finishGameDate
        }
    }

}