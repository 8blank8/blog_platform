import { Blogs } from "src/features/blog/domain/typeorm/blog.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PostLikes } from "./post.like.entity";
import { PostComments } from "src/features/comment/domain/typeorm/comment.entitty";


@Entity()
export class Posts {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    title: string

    @Column({ nullable: false })
    shortDescription: string

    @Column({ nullable: false })
    content: string

    @Column('uuid', { nullable: true })
    userId: string

    @Column('timestamp without time zone', { nullable: false, default: () => 'now()' })
    createdAt: string

    @ManyToOne(() => Blogs, blog => blog.id)
    blog: Blogs

    @OneToMany(() => PostLikes, postLikes => postLikes.post)
    postLikes: PostLikes[]

    @OneToMany(() => PostComments, postComment => postComment.post)
    postComments: PostComments[]
} 