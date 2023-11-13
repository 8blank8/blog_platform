import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuizQestion } from "./question.entity";
import { Users } from "../../../../features/user/domain/typeorm/user.entity";
import { Game } from "./quiz.game";
import { QuizPlayer } from "./quiz.player.entity";


@Entity()
export class Answer {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    questionId: string

    @ManyToOne(() => QuizQestion, quest => quest.id)
    question: QuizQestion;

    @Column({ nullable: false })
    answerStatus: 'Correct' | 'Incorrect';

    @Column({ default: () => 'now()' })
    addedAt: string

    @Column({ nullable: false })
    userId: string

    @ManyToOne(() => QuizPlayer, user => user.id)
    user: QuizPlayer

    @Column()
    gameId: string
}