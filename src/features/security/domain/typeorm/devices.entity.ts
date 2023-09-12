import { Users } from "../../../../features/user/domain/typeorm/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Devices {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    lastActiveDate: string

    @Column({ nullable: false })
    ip: string

    @Column({ nullable: true })
    title: string

    @ManyToOne(() => Users, user => user.id)
    user: Users
}