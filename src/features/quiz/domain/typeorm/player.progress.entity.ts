import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Game } from './quiz.game';
import { Users } from '../../../../features/user/domain/typeorm/user.entity';
import { Answer } from './answer.entity';

@Entity()
export class PlayerProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Game, game => game.firstPlayerProgress)
  game: Game;
  
  @OneToMany(()=> Answer, answer => answer.user)
  answers: Answer;

  @ManyToOne(()=>Users, user => user.id)
  player: Users;

  @Column({default: 0})
  score: number;
}