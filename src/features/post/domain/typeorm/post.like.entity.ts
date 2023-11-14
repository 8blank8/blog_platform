import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '@app/features/user/domain/typeorm/user.entity';

import { Posts } from './post.entity';

@Entity()
export class PostLikes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('timestamp without time zone', {
    nullable: false,
    default: () => 'now()',
  })
  addedAt: string;

  @Column({ nullable: false })
  likeStatus: 'Like' | 'DisLike' | 'None';

  @ManyToOne(() => Users, (user) => user.id)
  user: Users;

  @ManyToOne(() => Posts, (post) => post.id)
  post: Posts;
}
