import { Users } from "../../../user/domain/typeorm/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Game } from "./quiz.game";


@Entity()
export class QuizScore {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ default: 0 })
    score: number

    @Column({ nullable: false })
    userId: string

    @ManyToOne(() => Users, user => user.id)
    user: Users

    @ManyToOne(() => Game, game => game.id)
    game: Game
}