import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuizQestion } from "./question.entity";
import { PlayerProgress } from "./player.progress.entity";

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstPlayerId: string

  @OneToOne(() => PlayerProgress, playerProgress => playerProgress.game)
  firstPlayerProgress: PlayerProgress;

  @Column({nullable: true})
  secondPlayerId: string

  @OneToOne(() => PlayerProgress, playerProgress => playerProgress.game, {nullable: true})
  secondPlayerProgress: PlayerProgress;

  @OneToMany(() => QuizQestion, question => question.quizGame, {nullable: true})
  questions: QuizQestion[];

  @Column()
  status: 'PendingSecondPlayer' | 'Active' | 'Finished';

  @Column()
  pairCreatedDate: string;

  @Column({nullable: true})
  startGameDate: string;

  @Column({nullable: true})
  finishGameDate: string;
}