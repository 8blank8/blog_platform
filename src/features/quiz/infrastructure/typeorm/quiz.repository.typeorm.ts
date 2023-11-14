import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from '@quiz/domain/typeorm/answer.entity';
import { QuizQestion } from '@quiz/domain/typeorm/question.entity';
import { Game } from '@quiz/domain/typeorm/quiz.game';
import { QuizPlayer } from '@quiz/domain/typeorm/quiz.player.entity';
import { QuizScore } from '@quiz/domain/typeorm/quiz.score.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuizRepositoryTypeorm {
  constructor(
    @InjectRepository(QuizQestion) private questRepo: Repository<QuizQestion>,
    @InjectRepository(Game) private gameRepo: Repository<Game>,
    @InjectRepository(Answer) private answerRepo: Repository<Answer>,
    @InjectRepository(QuizScore) private scoreRepo: Repository<QuizScore>,
    @InjectRepository(QuizPlayer) private playerRepo: Repository<QuizPlayer>,
  ) {}

  async saveQuest(quest: QuizQestion) {
    return this.questRepo.save(quest);
  }

  async deleteQuest(questId: string) {
    return this.questRepo.delete({ id: questId });
  }

  async saveGame(game: Game) {
    return this.gameRepo.save(game);
  }

  async saveAnswer(answer: Answer) {
    return this.answerRepo.save(answer);
  }

  async saveScore(score: QuizScore) {
    return this.scoreRepo.save(score);
  }

  async savePlayer(player: QuizPlayer) {
    return this.playerRepo.save(player);
  }
}
