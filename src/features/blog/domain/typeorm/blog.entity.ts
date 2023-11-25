import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Posts } from '@post/domain/typeorm/post.entity';
import { Users } from '@user/domain/typeorm/user.entity';
import { BlogBan } from './blog.ban.entity';
import { BlogImage } from './blog.image';

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

  @Column({ default: false })
  isBanned: boolean

  @Column({ type: 'timestamp without time zone', nullable: true })
  banDate: string | null

  @OneToMany(() => Posts, (post) => post.blog)
  posts: Posts[];

  @ManyToOne(() => Users, user => user.id)
  user: Users

  @OneToOne(() => BlogBan, ban => ban.blog, { onDelete: 'CASCADE' })
  banInfo: BlogBan

  @OneToMany(() => BlogImage, image => image.blog)
  images: BlogImage[]
}
