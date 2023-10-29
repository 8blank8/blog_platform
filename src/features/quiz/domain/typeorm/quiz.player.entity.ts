import { Users } from "../../../user/domain/typeorm/user.entity";
import { Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./quiz.game";


@Entity()
export class QuizPlayer {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({nullable: false})
    userId: string

    @ManyToOne(() => Users, user => user.id)
    user: Users

    @Column({ default: 0 })
    winsCount: number

    @Column({ default: 0 })
    lostCount: number

    @Column({ default: 0 })
    gamesCount: number

    @Column({default: 0})
    sumScore: number

    // @OneToMany(()=> Game, game => game.id)
    // games: Game[]
}