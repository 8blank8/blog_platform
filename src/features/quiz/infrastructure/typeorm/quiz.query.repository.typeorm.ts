import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { QuizQestion } from "../../domain/typeorm/question.entity";
import { Repository } from "typeorm";
import { QuestionQueryParam } from "../../models/question.query.param";
import { QuestPagniation } from "../../../../entity/pagination/quest/quest.pagination";
import { Game } from "../../domain/typeorm/quiz.game";
import { PlayerProgress } from "../../domain/typeorm/player.progress.entity";


@Injectable()
export class QuizQueryRepositoryTypeorm {
    constructor(
        @InjectRepository(QuizQestion) private questRepo: Repository<QuizQestion>,
        @InjectRepository(Game) private gameRepo: Repository<Game>,
        @InjectRepository(PlayerProgress) private playerProgressRepo: Repository<PlayerProgress>
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
            .limit(5)
            .getMany()

        return randomQuestion
    }

    async findActiveGameByUserId(userId: string) {

        const game = await this.gameRepo.createQueryBuilder('g')
                .where('g."firstPlayerId" = :userId', {userId})
                .orWhere('g."secondPlayerId" = :userId', {userId})
                .andWhere(`g.finishGameDate IS NULL`)
                .getOne()

        return game
    }

    async findPendingGame(): Promise<Game | null>{
        const pendingGame = await this.gameRepo.createQueryBuilder('g')
                .where(`g.status = 'PendingSecondPlayer'`)
                .getOne()

        return pendingGame
    }
  
    async findGameByGameId(gameId: string){
        const game = await this.gameRepo.createQueryBuilder('g')
            .where(`g.id = :gameId`, {gameId})
            .leftJoinAndSelect(`g.firstPlayerProgress`, 'fpp')
            .leftJoinAndSelect(`g.secondPlayerProgress`, `spp`)
            .leftJoinAndSelect(`g.questions`, `quest`)
            .getOne()

        if(!game) return null

        const firstPlayer = await this.playerProgressRepo.createQueryBuilder('p')
                .where(`p."playerId" = :id`, {id: game.firstPlayerId})
                .getOne()

        console.log(firstPlayer)
        return game
    }
   

  
  
}