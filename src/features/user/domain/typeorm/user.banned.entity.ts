import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./user.entity";

@Entity()
export class UserBanned {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ default: false })
    isBanned: boolean

    @Column({ type: 'text', nullable: true })
    banReason: string | null

    @Column({ type: 'timestamp without time zone', nullable: true })
    banDate: string | null

    @ManyToOne(() => Users, user => user.id, { onDelete: 'CASCADE' })
    user: Users
}