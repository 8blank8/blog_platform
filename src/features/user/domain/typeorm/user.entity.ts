import { PostLikes } from "../../../../features/post/domain/typeorm/post.like.entity";
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UsersPassword } from "./user.password.entity";
import { UsersConfirmationEmail } from "./user.confirmation.email.entity";
import { QuizPlayer } from "../../../quiz/domain/typeorm/quiz.player.entity";


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

    @OneToOne(() => UsersPassword, password => password.user, { onDelete: "CASCADE" })
    password: UsersPassword

    @OneToOne(() => UsersConfirmationEmail, confirmation => confirmation.user, { onDelete: "CASCADE" })
    confirmationInfo: UsersConfirmationEmail
}