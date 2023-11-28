import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostLikes } from '@post/domain/typeorm/post.like.entity';

import { UsersPassword } from './user.password.entity';
import { UsersConfirmationEmail } from './user.confirmation.email.entity';
import { UserBanned } from './user.banned.entity';
import { UserTelegramProfile } from './user.telegram.profile.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  login: string;

  @Column({ nullable: false })
  email: string;

  @Column('timestamp without time zone', {
    nullable: false,
    default: () => 'now()',
  })
  createdAt: string;

  @OneToMany(() => PostLikes, (postLikes) => postLikes.user, {
    onDelete: 'CASCADE',
  })
  postLikes: PostLikes[];

  @OneToOne(() => UsersPassword, (password) => password.user, {
    onDelete: 'CASCADE',
  })
  password: UsersPassword;

  @OneToOne(() => UsersConfirmationEmail, (confirmation) => confirmation.user, {
    onDelete: 'CASCADE',
  })
  confirmationInfo: UsersConfirmationEmail;

  @OneToOne(() => UserBanned, userBanned => userBanned.user, {
    onDelete: 'CASCADE',
  })
  banInfo: UserBanned

  @OneToOne(() => UserTelegramProfile, profile => profile.user, { onDelete: 'CASCADE', nullable: true })
  telegramProfile: UserTelegramProfile

  @Column({ nullable: true })
  telegramCode: string
}
