import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuizGame } from "./quiz.game.entity";
import { Users } from "src/features/user/domain/typeorm/user.entity";


@Entity()
export class QuizPlayerScore {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ default: 0 })
    score: number

    @ManyToOne(() => QuizGame, quiz => quiz.id)
    quizGame: QuizGame

    @Column({ nullable: false })
    userId: string

    @ManyToOne(() => Users, user => user.id)
    user: Users

}