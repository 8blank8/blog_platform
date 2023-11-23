import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Blogs } from "./blog.entity";


@Entity()
export class BlogBan {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ default: false })
    isBanned: boolean

    @Column({ type: 'timestamp without time zone', nullable: true })
    banDate: string | null

    @ManyToOne(() => Blogs, blog => blog.id)
    blog: Blogs
}