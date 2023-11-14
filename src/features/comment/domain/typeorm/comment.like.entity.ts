import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '@user/domain/typeorm/user.entity';

import { PostComments } from './comment.entitty';

@Entity()
export class PostCommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  likeStatus: 'Like' | 'Dislike' | 'None';

  @ManyToOne(() => Users, (user) => user.id)
  user: Users;

  @ManyToOne(() => PostComments, (postComment) => postComment.id)
  comment: PostComments;
}
