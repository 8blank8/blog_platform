import { Users } from "../../../../features/user/domain/typeorm/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuizGame } from "./quiz.game.entity";


@Entity()
export class QuizPlayerScore {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ default: 0 })
    score: number

    @Column({ nullable: false })
    userId: string

    @ManyToOne(() => Users, user => user.id)
    user: Users

    @ManyToOne(() => QuizGame, quiz => quiz.id)
    quizGame: QuizGame
}