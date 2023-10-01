import { Users } from "src/features/user/domain/typeorm/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { QuizResponse } from "./quiz.response.entity";


@Entity()
export class QuizGame {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ array: true, type: 'varchar', nullable: true })
    questions: string[]

    @Column()
    status: 'PendingSecondPlayer' | 'Active'

    @Column({ nullable: true })
    pairCreatedDate: string

    @Column({ nullable: true })
    startGameDate: string

    @Column({ nullable: true })
    finishGameDate: string

    @Column({ default: 0 })
    firstPlayerScore: number

    @Column({ default: 0 })
    secondPlayerScore: number

    @ManyToOne(() => Users, user => user.id)
    firstPlayer: Users

    @ManyToOne(() => Users, user => user.id)
    secondPlayer: Users

    @OneToMany(() => QuizResponse, resp => resp.quizGame)
    quizResponse: QuizResponse[]
}


