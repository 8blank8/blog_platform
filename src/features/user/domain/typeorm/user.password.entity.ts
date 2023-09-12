import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./user.entity";


@Entity()
export class UsersPassword {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    passwordHash: string

    @Column({ nullable: false })
    passwordSalt: string

    @ManyToOne(() => Users, user => user.id, { onDelete: "CASCADE" })
    user: Users

}