import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '@app/features/user/domain/typeorm/user.entity';

@Entity()
export class Devices {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  lastActiveDate: string;

  @Column({ nullable: false })
  ip: string;

  @Column({ nullable: false, default: '' })
  title: string;

  @ManyToOne(() => Users, (user) => user.id)
  user: Users;
}
