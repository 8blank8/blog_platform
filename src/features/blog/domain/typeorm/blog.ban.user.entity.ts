import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Blogs } from "./blog.entity";
import { Users } from "@user/domain/typeorm/user.entity";


@Entity()
export class BlogBanUser {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ default: false })
    isBanned: boolean

    @Column({ type: 'text', nullable: true })
    banReason: string | null

    @Column({ type: 'timestamp without time zone', nullable: true })
    banDate: string | null

    @Column({ type: 'timestamp without time zone', default: () => 'now()' })
    createdAt: string

    @ManyToOne(() => Blogs, blog => blog.id)
    blog: Blogs

    @ManyToOne(() => Users, user => user.id)
    user: Users
}