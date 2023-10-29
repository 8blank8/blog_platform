import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuizQestion } from "../../domain/typeorm/question.entity";
import { Repository } from "typeorm";
import { QuestionQueryParam } from "../../models/question.query.param";
import { QuestPagniation } from "../../../../entity/pagination/quest/quest.pagination";
import { Game } from "../../domain/typeorm/quiz.game";
import { Answer } from "../../domain/typeorm/answer.entity";
import { QuizScore } from "../../domain/typeorm/quiz.score.entity";
import { QuizPlayer } from "../../domain/typeorm/quiz.player.entity";
import { PlayerStatisticViewModel } from "../../models/player.statistic.view.model";


@Injectable()
export class QuizQueryRepositoryTypeorm {
    constructor(
        @InjectRepository(QuizQestion) private questRepo: Repository<QuizQestion>,
        @InjectRepository(Game) private gameRepo: Repository<Game>,
        @InjectRepository(Answer) private answerRepo: Repository<Answer>,
        @InjectRepository(QuizScore) private scoreRepo: Repository<QuizScore>,
        @InjectRepository(QuizPlayer) private playerRepo: Repository<QuizPlayer>,
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

        const totalCount = this.questRepo.createQueryBuilder('qs')
            .where('qs.body ILIKE :bodySearchTerm', { bodySearchTerm })


        if (publishedStatus !== null) {
            totalCount.andWhere('qs.published = :publishedStatus', { publishedStatus: publishedStatus ?? null })
        }

        const count = await totalCount.getCount()

        return {
            pagesCount: Math.ceil(count / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: count,
            items: questions
        }
    }

    async getFiveRandomQuestion(): Promise<QuizQestion[]> {
        const randomQuestion = await this.questRepo.createQueryBuilder('q')
            // .orderBy("RANDOM()")
            .orderBy('q.createdAt', 'DESC')
            .limit(5)
            .getMany()

        return randomQuestion
    }

    async findActiveGameByUserId(userId: string) {

        const game = await this.gameRepo.createQueryBuilder('g')
            .where('g."firstPlayerId" = :userId OR g."secondPlayerId" = :userId', { userId })
            .andWhere(`g.finishGameDate IS NULL AND g."status" != 'Finished'`)
            .getOne()

        return game
    }

    async findPendingGame(): Promise<Game | null> {
        const pendingGame = await this.gameRepo.createQueryBuilder('g')
            .where(`g.status = 'PendingSecondPlayer'`)
            .getOne()

        return pendingGame
    }

    async findGameByGameId(gameId: string): Promise<GameViewModel | null> {
        const game = await this.gameRepo.createQueryBuilder('g')
            .where(`g.id = :gameId`, { gameId })
            // .leftJoinAndSelect(`g.answer`, 'a')
            // .orderBy(`a.addedAt`, "ASC")
            // .leftJoinAndSelect(`g.firstPlayerAnswer`, 'fpa')
            // .leftJoinAndSelect(`g.secondPlayerAnswer`, `spa`)
            .leftJoinAndSelect(`g.firstPlayer`, 'fp')
            .leftJoinAndSelect(`fp.user`, 'fu')
            .leftJoinAndSelect(`g.secondPlayer`, 'sp')
            .leftJoinAndSelect(`sp.user`, 'su')
            .leftJoinAndSelect(`g.score`, 's')
            // .leftJoinAndSelect(`g.questions`, `quest`)
            .getOne()
        if (!game) return null

        return this._mapGame(game)
    }

    async findFullGameByGameId(gameId: string): Promise<Game | null> {
        const game = await this.gameRepo.createQueryBuilder('g')
            .where(`g.id = :gameId`, { gameId })
            // .leftJoinAndSelect(`g.answer`, 'a')
            // .orderBy(`a.addedAt`, "ASC")
            // .leftJoinAndSelect(`g.firstPlayerAnswer`, 'fpa')
            // .leftJoinAndSelect(`g.secondPlayerAnswer`, `spa`)
            .leftJoinAndSelect(`g.firstPlayer`, 'fp')
            .leftJoinAndSelect(`fp.user`, 'fu')
            .leftJoinAndSelect(`g.secondPlayer`, 'sp')
            .leftJoinAndSelect(`sp.user`, 'su')
            .leftJoinAndSelect(`g.score`, 's')
            .leftJoinAndSelect(`s.user`, 'u')
            // .leftJoinAndSelect(`g.questions`, `quest`)
            .getOne()

        return game
    }

    async findMyCurrentGameByUserId(userId: string): Promise<GameViewModel | null> {
        const game = await this.gameRepo.createQueryBuilder('g')
            .where(`(g."firstPlayerId" = :userId OR g."secondPlayerId" = :userId)`, { userId })
            .andWhere(`g."finishGameDate" IS NULL AND g."status" != 'Finished'`)
            // .andWhere(`g.status != 'Finished'`)
            // .leftJoinAndSelect(`g.answer`, 'a')
            // .orderBy(`a.addedAt`, "ASC")
            // .leftJoinAndSelect(`g.firstPlayerAnswer`, 'fpa')
            // .leftJoinAndSelect(`g.secondPlayerAnswer`, `spa`)
            .leftJoinAndSelect(`g.firstPlayer`, 'fp')
            .leftJoinAndSelect(`fp.user`, 'fu')
            .leftJoinAndSelect(`g.secondPlayer`, 'sp')
            .leftJoinAndSelect(`sp.user`, 'su')
            .leftJoinAndSelect(`g.score`, 's')
            // .leftJoinAndSelect(`g.questions`, `quest`)
            // .orderBy(`quest.createdAt`, "DESC")
            .getOne()

        if (!game) return null

        return this._mapGame(game)
    }

    async findMyCurrentGameFullByUserId(userId: string): Promise<Game | null> {
        const game = await this.gameRepo.createQueryBuilder('g')
            .where(`(g."firstPlayerId" = :userId OR g."secondPlayerId" = :userId)`, { userId })
            .andWhere(`g.finishGameDate IS NULL AND g."status" != 'Finished'`)
            // .leftJoinAndSelect(`g.answer`, 'a')
            // .orderBy(`a.addedAt`, "ASC")
            // .leftJoinAndSelect(`g.firstPlayerAnswer`, 'fpa')
            // .leftJoinAndSelect(`g.secondPlayerAnswer`, `spa`)
            .leftJoinAndSelect(`g.firstPlayer`, 'fp')
            .leftJoinAndSelect(`fp.user`, 'fu')
            .leftJoinAndSelect(`g.secondPlayer`, 'sp')
            .leftJoinAndSelect(`sp.user`, 'su')
            .leftJoinAndSelect(`g.score`, 's')
            // .leftJoinAndSelect(`g.questions`, `quest`)
            // .orderBy(`quest.createdAt`, "DESC")
            .getOne()

        return game
    }

    async findUserAnswers(gameId: string, userId: string): Promise<Answer[]> {
        const answers = await this.answerRepo.createQueryBuilder(`a`)
            .where(`a."gameId" = :gameId`, { gameId })
            .andWhere(`a."userId" = :userId`, { userId })
            .orderBy(`a.addedAt`, "ASC")
            .getMany()

        return answers
    }

    async findAnswerById(answerId: string): Promise<AnswerViewModel | null> {
        const answer = await this.answerRepo.createQueryBuilder('a')
            .where(`a.id = :answerId`, { answerId })
            .leftJoinAndSelect(`a.question`, 'q')
            .getOne()

        if (!answer) return null

        return this._mapAnswer(answer)
    }

    async findPlayerScoreByUserId(gameId: string, userId: string): Promise<QuizScore | null> {
        const score = await this.scoreRepo.createQueryBuilder('s')
            .where(`s.userId = :userId`, { userId })
            .andWhere(`s."gameId" = :gameId`, { gameId })
            .getOne()

        return score
    }

    async findPlayerById(userId: string): Promise<QuizPlayer | null> {
        const player = await this.playerRepo.createQueryBuilder('p')
            .where(`p.userId = :userId`, { userId })
            .getOne()

        return player
    }

    async findPlayerByPlayerId(playerId: string): Promise<QuizPlayer | null> {
        const player = await this.playerRepo.createQueryBuilder('p')
            .where(`p.id = :playerId`, { playerId })
            .getOne()

        return player
    }

    async findMyStatistic(userId: string): Promise<PlayerStatisticViewModel | null> {
        const statistic = await this.playerRepo.createQueryBuilder(`p`)
            .where(`p.userId = :userId`, { userId })
            .getOne()

        if (!statistic) return null
        return this._mapPlayerStatistic(statistic)
    }

    private _mapPlayerStatistic(statistic: QuizPlayer): PlayerStatisticViewModel {
        return {
            sumScore: 0,
            avgScores: 0,
            gamesCount: statistic.gamesCount,
            winsCount: statistic.winsCount,
            lossesCount: statistic.lostCount,
            drawsCount: 0
        }
    }

    private _mapGame(game: Game): GameViewModel {

        let firstPlayerAnswer: any = []
        let secondPlayerAnswer: any = []

        if (game.answer && game.answer.length !== 0) {
            game.answer.forEach(item => {
                if (item.userId === game.firstPlayer.user.id) {
                    firstPlayerAnswer.push(this._mapAnswer(item))
                } else {
                    secondPlayerAnswer.push(this._mapAnswer(item))
                }
            })
        }

        let secondPlayerProgress: PlayerProgressModel | null = null

        let firstPlayerScore: number = 0
        let secondPlayerScore: number = 0

        if (game.score) {
            game.score.forEach(item => {
                if (item.userId === game.firstPlayer.id) {
                    firstPlayerScore = item.score
                } else {
                    secondPlayerScore = item.score
                }
            })
        }
        // if (game.secondPlayerAnswer.length !== 0) {
        //     secondPlayerAnswer = game.secondPlayerAnswer.map(this._mapAnswer)
        // }

        if (game.secondPlayer) {
            secondPlayerProgress = {
                answers: secondPlayerAnswer,
                player: {
                    id: game.secondPlayer.user.id,
                    login: game.secondPlayer.user.login
                },
                score: secondPlayerScore
            }
        }

        let questions: QuestionModel[] | null = null

        if (game.questions) {
            questions = game.questions.map(this._mapQuestion)
        }

        return {
            id: game.id,
            firstPlayerProgress: {
                answers: firstPlayerAnswer,
                player: {
                    id: game.firstPlayer.user.id,
                    login: game.firstPlayer.user.login
                },
                score: firstPlayerScore
            },
            secondPlayerProgress: secondPlayerProgress,
            questions: questions,
            status: game.status,
            pairCreatedDate: game.pairCreatedDate,
            startGameDate: game.startGameDate,
            finishGameDate: game.finishGameDate
        }
    }

    private _mapAnswer(answer: Answer): AnswerViewModel {
        return {
            answerStatus: answer.answerStatus,
            addedAt: new Date(answer.addedAt).toISOString(),
            questionId: answer.questionId
        }
    }

    private _mapQuestion(quest: QuizQestion): QuestionModel {
        return {
            id: quest.id,
            body: quest.body
        }
    }
}


class GameViewModel {
    id: string
    firstPlayerProgress: PlayerProgressModel
    secondPlayerProgress: PlayerProgressModel | null
    questions: QuestionModel[] | null
    status: 'PendingSecondPlayer' | 'Active' | 'Finished'
    pairCreatedDate: string
    startGameDate: string | null
    finishGameDate: string | null
}

class PlayerProgressModel {
    answers: AnswerViewModel[] | []
    player: {
        id: string
        login: string
    }
    score: number
}

class AnswerViewModel {
    answerStatus: "Correct" | "Incorrect"
    addedAt: string
    questionId: string
}

class QuestionModel {
    id: string
    body: string
}