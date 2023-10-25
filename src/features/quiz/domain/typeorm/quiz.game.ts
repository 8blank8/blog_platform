import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuizQestion } from "./question.entity";
import { Users } from "../../../user/domain/typeorm/user.entity";
import { Answer } from "./answer.entity";

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, user => user.id)
  firstPlayer: Users

  // @OneToOne(() => PlayerProgress, playerProgress => playerProgress.game)
  // firstPlayerProgress: PlayerProgress;

  // @OneToMany(() => Answer, answer => answer.user)
  // firstPlayerAnswer: Answer[];
  @OneToMany(()=> Answer, answer => answer.game)
  answer: Answer[]

  @Column({ default: 0 })
  firstPlayerScore: number

  @ManyToOne(() => Users, user => user.id)
  secondPlayer: Users

  // @OneToMany(() => Answer, answer => answer.user)
  // secondPlayerAnswer: Answer[];

  @Column({ default: 0 })
  secondPlayerScore: number
  // @OneToOne(() => PlayerProgress, playerProgress => playerProgress.game, { nullable: true })
  // secondPlayerProgress: PlayerProgress;

  // @OneToMany(() => QuizQestion, question => question.quizGame, { nullable: true })
  // questions: QuizQestion[];

  @Column( {nullable: true, type: 'json'})
  questions: Array<QuizQestion>

  @Column()
  status: 'PendingSecondPlayer' | 'Active' | 'Finished';

  @Column()
  pairCreatedDate: string;

  @Column({ nullable: true })
  startGameDate: string;

  @Column({ nullable: true })
  finishGameDate: string;
}