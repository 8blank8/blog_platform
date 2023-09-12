import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./user.entity";


@Entity()
export class UsersConfirmationEmail {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    isConfirmed: boolean

    @Column()
    code: string

    @ManyToOne(() => Users, user => user.id, { onDelete: "CASCADE" })
    user: Users
}