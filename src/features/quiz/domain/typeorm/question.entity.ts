import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuizGame } from "./quiz.game.entity";


@Entity()
export class QuizQestion {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    body: string

    @Column({ type: 'varchar', array: true })
    correctAnswers: string[]

    @Column({ default: false })
    published: boolean

    @Column({ type: 'timestamp without time zone', default: () => 'now()' })
    createdAt: string

    @Column({ type: 'timestamp without time zone', default: () => 'now()' })
    updatedAt: string

    @ManyToOne(() => QuizGame, game => game.id)
    quizGame: QuizGame
}