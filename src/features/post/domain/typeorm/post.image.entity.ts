import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Posts } from "./post.entity";


@Entity()
export class PostImage {

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

    @ManyToOne(() => Posts, post => post.id)
    post: Posts
}