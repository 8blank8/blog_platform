import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { Blogs } from "./blog.entity";


@Entity()
export class BlogImage {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    title: 'wallpaper' | 'main'

    @Column()
    url: string

    @Column()
    width: number

    @Column()
    height: number

    @Column()
    fileSize: number

    @ManyToOne(() => Blogs, blog => blog.id)
    blog: Blogs
}