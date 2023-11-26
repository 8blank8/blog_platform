import { Blogs } from '@blog/domain/typeorm/blog.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostComments } from '@comment/domain/typeorm/comment.entitty';

import { PostLikes } from './post.like.entity';
import { Users } from '@user/domain/typeorm/user.entity';
import { PostImage } from './post.image.entity';

@Entity()
export class Posts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  shortDescription: string;

  @Column({ nullable: false })
  content: string;

  @Column('uuid', { nullable: true })
  userId: string;

  @Column('timestamp without time zone', {
    nullable: false,
    default: () => 'now()',
  })
  createdAt: string;

  @ManyToOne(() => Users, user => user.id)
  user: Users

  @ManyToOne(() => Blogs, (blog) => blog.id)
  blog: Blogs;

  @OneToMany(() => PostLikes, (postLikes) => postLikes.post)
  postLikes: PostLikes[];

  @OneToMany(() => PostComments, (postComment) => postComment.post)
  postComments: PostComments[];

  @OneToMany(() => PostImage, image => image.post)
  images: PostImage[]
}
