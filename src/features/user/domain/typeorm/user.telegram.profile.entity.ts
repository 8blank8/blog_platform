import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "./user.entity";


@Entity()
export class UserTelegramProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    username: string

    @Column()
    telegramId: string

    @Column()
    userId: string

    @OneToOne(() => Users, user => user.telegramProfile, { onDelete: 'CASCADE' })
    user: Users
}