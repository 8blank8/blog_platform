import { PostComments } from "src/features/comment/domain/typeorm/comment.entitty";
import { PostLikes } from "../../../../features/post/domain/typeorm/post.like.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UsersPassword } from "./user.password.entity";


@Entity()
export class Users {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    login: string

    @Column({ nullable: false })
    email: string

    @Column('timestamp without time zone', { nullable: false, default: () => 'now()' })
    createdAt: string

    @OneToMany(() => PostLikes, postLikes => postLikes.user, { onDelete: "CASCADE" })
    postLikes: PostLikes[]
}