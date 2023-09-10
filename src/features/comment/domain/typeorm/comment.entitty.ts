import { Blogs } from "src/features/blog/domain/typeorm/blog.entity";
import { Posts } from "src/features/post/domain/typeorm/post.entity";
import { Users } from "src/features/user/domain/typeorm/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class PostComments {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    content: string

    @Column('timestamp without time zone', { nullable: false, default: () => 'now()' })
    createdAt: string

    @ManyToOne(() => Users, user => user.id)
    user: Users

    @ManyToOne(() => Posts, post => post.id)
    post: Posts

    @ManyToOne(() => Blogs, blog => blog.id)
    blog: Blogs
}