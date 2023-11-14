import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Game } from './quiz.game';
import { QuizPlayer } from './quiz.player.entity';

@Entity()
export class QuizScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  score: number;

  @Column({ nullable: false })
  userId: string;

  @ManyToOne(() => QuizPlayer, (user) => user.id)
  user: QuizPlayer;

  @ManyToOne(() => Game, (game) => game.id)
  game: Game;
}
