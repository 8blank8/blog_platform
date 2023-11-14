import { Module } from '@nestjs/common';
import { QuizController } from './api/sa/quiz.sa.controller';
import { QuizPublicController } from './api/public/quiz.public.controller';
import { AddAnswerUseCase } from './application/useCases/add.answer.use.case';
import { ConnectionGameUseCase } from './application/useCases/connection.game.use.case';
import { UpdatePublishedQuestUseCase } from './application/useCases/update.published.quest.use.case';
import { UpdateQuestionUseCase } from './application/useCases/update.question.use.case';
import { DeleteQuestionUseCase } from './application/useCases/delete.question.use.case';
import { CreateQuestionUseCase } from './application/useCases/create.question.use.case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizPlayer } from './domain/typeorm/quiz.player.entity';
import { QuizScore } from './domain/typeorm/quiz.score.entity';
import { Answer } from './domain/typeorm/answer.entity';
import { Game } from './domain/typeorm/quiz.game';
import { QuizQestion } from './domain/typeorm/question.entity';
import { QuizRepositoryTypeorm } from './infrastructure/typeorm/quiz.repository.typeorm';
import { QuizQueryRepositoryTypeorm } from './infrastructure/typeorm/quiz.query.repository.typeorm';
import { UserModule } from '../user/user.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      QuizQestion,
      Game,
      Answer,
      QuizScore,
      QuizPlayer,
    ]),
    UserModule,
  ],
  controllers: [QuizController, QuizPublicController],
  providers: [
    CreateQuestionUseCase,
    DeleteQuestionUseCase,
    UpdateQuestionUseCase,
    UpdatePublishedQuestUseCase,
    ConnectionGameUseCase,
    AddAnswerUseCase,

    QuizQueryRepositoryTypeorm,
    QuizRepositoryTypeorm,
  ],
  exports: [],
})
export class QuizModule {}
