import { Users } from "../../../../features/user/domain/typeorm/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { QuizQestion } from "./question.entity";
import { QuizPlayerScore } from "./quiz.player.score.entity";
import { QuizResponse } from "./quiz.response.entity";


@Entity()
export class QuizGame {

    @PrimaryGeneratedColumn('uuid')
    id: string

    // @Column({ nullable: true })
    // questions: string[]

    @Column()
    status: 'PendingSecondPlayer' | 'Active'

    @Column({ nullable: true })
    pairCreatedDate: string

    @Column({ nullable: true })
    startGameDate: string

    @Column({ nullable: true })
    finishGameDate: string

    // @Column({ default: 0 })
    // firstPlayerScore: number

    // @Column({ default: 0 })
    // secondPlayerScore: number

    @OneToMany(() => QuizPlayerScore, score => score.quizGame)
    score: QuizPlayerScore[]

    @OneToMany(() => QuizQestion, quest => quest.quizGame, { nullable: true })
    questions: QuizQestion[]

    @ManyToOne(() => Users, user => user.id)
    firstPlayer: Users

    @OneToMany(() => QuizResponse, response => response.quizGame)
    answers: QuizResponse[]

    // @OneToMany(() => QuizResponse, response => response.user)
    // secondPlayerAnswers: QuizResponse[]

    @ManyToOne(() => Users, user => user.id)
    secondPlayer: Users
}


