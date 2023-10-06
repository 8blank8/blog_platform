import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuizQestion } from "../../domain/typeorm/question.entity";
import { Repository } from "typeorm";
import { QuestionQueryParam } from "../../models/question.query.param";
import { QuestPagniation } from "../../../../entity/pagination/quest/quest.pagination";
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
            .where('id = :questId', { questId })
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


    async findGameById(gameId: string) {
        const game = await this.quizGameRepo.createQueryBuilder('q')
            .where(`q.id = :gameId`, { gameId })
            .leftJoinAndSelect(`q.firstPlayer`, 'fp')
            .leftJoinAndSelect(`q.secondPlayer`, 'sp')
            .leftJoinAndSelect('q.questions', 'quest')
            .leftJoinAndSelect(`q.answers`, 'fpa')
            .getOne()

        if (!game) return null

        return this._mapQuizGame(game)
    }

    async findMyActiveGame(userId: string) {
        const game = await this.quizGameRepo.createQueryBuilder('q')
            .where(`q."firstPlayerId" = :userId`, { userId })
            .orWhere(`q."secondPlayerId" = :userId`, { userId })
            .andWhere(`q.finishGameDate IS NULL`)
            .leftJoinAndSelect(`q.firstPlayer`, 'fp')
            .leftJoinAndSelect(`q.secondPlayer`, 'sp')
            .leftJoinAndSelect('q.questions', 'quest')
            .leftJoinAndSelect(`q.answers`, 'fpa')
            .leftJoinAndSelect(`q.score`, 'score')
            .getOne()

        if (!game) return null

        return this._mapQuizGame(game)
    }

    async findFullActiveGameByUserId(userId: string): Promise<QuizGame | null> {
        return this.quizGameRepo.createQueryBuilder('q')
            .where(`q."firstPlayerId" = :userId`, { userId })
            .orWhere(`q."secondPlayerId" = :userId`, { userId })
            .andWhere(`q.finishGameDate IS NULL`)
            .leftJoinAndSelect(`q.firstPlayer`, 'fp')
            .leftJoinAndSelect(`q.secondPlayer`, 'sp')
            .leftJoinAndSelect('q.questions', 'quest')
            .leftJoinAndSelect(`q.score`, 'score')
            .getOne()
    }

    async findAnswersUser(userId: string, gameId: string): Promise<QuizResponse[]> {
        return this.quizResponseRepo.createQueryBuilder('q')
            .where(`q."userId" = :userId`, { userId })
            .andWhere(`q."quizGameId" = :gameId`, { gameId })
            .orderBy(`q.addedAt`, "DESC")
            .getMany()
    }

    async findAnswerById(answerId: string) {
        const answer = await this.quizResponseRepo.createQueryBuilder('q')
            .where(`q.id = :answerId`, { answerId })
            .leftJoinAndSelect(`q.question`, 'quest')
            .getOne()

        if (!answer) return null

        return this._mapAnswer(answer)
    }

    async findScoreUserByUserId(userId: string, gameId: string): Promise<QuizPlayerScore | null> {
        return this.quizPlayerScoreRepo.createQueryBuilder('q')
            .where('q."userId" = :userId', { userId })
            .andWhere(`q."quizGameId" = :gameId`, { gameId })
            .getOne()
    }

    _mapQuizGame(game: QuizGame) {
        let secondPlayer
        let questions

        let firstPlayerAnswers: any = []
        let secondPlayerAnswers: any = []

        let firstPlayerScore = 0
        let secondPlayerScore = 0

        if (game.score) {
            game.score.forEach(score => {
                if (score.userId === game.firstPlayer.id) {
                    firstPlayerScore = score.score
                } else {
                    secondPlayerScore = score.score
                }
            })
        }

        if (game.answers.length > 0) {
            game.answers.forEach(answer => {
                if (answer.userId === game.firstPlayer.id) {
                    firstPlayerAnswers.push({
                        questionId: answer.questionId,
                        answerStatus: answer.answerStatus,
                        addedAt: answer.addedAt
                    })
                } else {
                    secondPlayerAnswers.push({
                        questionId: answer.questionId,
                        answerStatus: answer.answerStatus,
                        addedAt: answer.addedAt
                    })
                }
            })
        }

        const firstPlayer = {
            answers: firstPlayerAnswers,
            player: {
                id: game.firstPlayer.id,
                login: game.firstPlayer.login
            },
            score: firstPlayerScore
        }

        if (game.secondPlayer) {
            secondPlayer = {
                answers: secondPlayerAnswers,
                player: {
                    id: game.secondPlayer.id,
                    login: game.secondPlayer.login
                },
                score: secondPlayerScore
            }
        }

        if (game.questions.length > 0) {
            questions = game.questions.map(quest => ({
                id: quest.id,
                body: quest.body
            }))
        }


        return {
            id: game.id,
            firstPlayerProgress: firstPlayer,
            secondPlayerProgress: secondPlayer ?? null,
            questions: questions ?? null,
            status: game.status,
            pairCreatedDate: game.pairCreatedDate,
            startGameDate: game.startGameDate,
            finishGameDate: game.finishGameDate
        }
    }

    _mapAnswer(answer: QuizResponse) {
        return {
            questionId: answer.question.id,
            answerStatus: answer.answerStatus,
            addedAt: answer.addedAt
        }
    }
}