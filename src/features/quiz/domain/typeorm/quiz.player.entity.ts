import { Users } from '@user/domain/typeorm/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class QuizPlayer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  userId: string;

  @ManyToOne(() => Users, (user) => user.id)
  user: Users;

  @Column({ default: 0 })
  winsCount: number;

  @Column({ default: 0 })
  lossesCount: number;

  @Column({ default: 0 })
  gamesCount: number;

  @Column({ default: 0 })
  sumScore: number;

  @Column({ default: 0 })
  drawsCount: number;

  @Column({ default: 0, type: 'float' })
  avgScores: number;
}
