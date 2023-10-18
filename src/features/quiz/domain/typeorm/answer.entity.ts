import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { QuizQestion } from "./question.entity";
import { Users } from "../../../../features/user/domain/typeorm/user.entity";


@Entity()
export class Answer {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ManyToOne(()=>QuizQestion, quest => quest.id)
    question: QuizQestion; 

    @Column({nullable: false})
    answerStatus: 'Correct' | 'Incorrect'; 

    @Column({default: ()=> 'now()'})
    addedAt: string

    @ManyToOne(()=> Users, user => user.id)
    user: Users
}