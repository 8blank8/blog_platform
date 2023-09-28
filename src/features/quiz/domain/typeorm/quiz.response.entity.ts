import { Users } from "src/features/user/domain/typeorm/user.entity";
import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { QuizGame } from "./quiz.game.entity";
import { QuizQestion } from "./question.entity";


@Entity()
export class QuizResponse {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    answerStatus: 'Correct' | 'Incorrect '

    @Column({ type: 'timestamp without time zone', default: () => 'now()' })
    addedAt: string

    @ManyToOne(() => Users, user => user.id)
    user: Users

    @ManyToOne(() => QuizGame, quiz => quiz.id)
    quizGame: QuizGame

    @ManyToOne(() => QuizQestion, quest => quest.id)
    question: QuizQestion
}