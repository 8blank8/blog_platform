import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Posts } from '@post/domain/typeorm/post.entity';
import { Users } from '@user/domain/typeorm/user.entity';

@Entity()
export class Blogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  description: string;

  @Column({ nullable: false })
  websiteUrl: string;

  @Column('timestamp without time zone', {
    nullable: false,
    default: () => 'now()',
  })
  createdAt: string;

  @Column({ nullable: false, default: false })
  isMembership: boolean;

  @OneToMany(() => Posts, (post) => post.blog)
  posts: Posts[];

  @ManyToOne(() => Users, user => user.id)
  user: Users
}
