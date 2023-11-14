import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizQestion } from './question.entity';
import { Answer } from './answer.entity';
import { QuizScore } from './quiz.score.entity';
import { QuizPlayer } from './quiz.player.entity';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuizPlayer, (user) => user.id)
  firstPlayer: QuizPlayer;

  @Column({ nullable: true, type: 'json' })
  answer: Array<Answer>;

  @ManyToOne(() => QuizPlayer, (user) => user.id)
  secondPlayer: QuizPlayer;

  @OneToMany(() => QuizScore, (score) => score.game)
  score: QuizScore[];

  @Column({ nullable: true, type: 'json' })
  questions: Array<QuizQestion>;

  @Column()
  status: 'PendingSecondPlayer' | 'Active' | 'Finished';

  @Column()
  pairCreatedDate: string;

  @Column({ nullable: true })
  startGameDate: string;

  @Column({ nullable: true })
  finishGameDate: string;

  @Column({ nullable: true })
  answerTime: Date;
}
