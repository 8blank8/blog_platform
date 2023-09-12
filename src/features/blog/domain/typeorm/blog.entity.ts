import { Posts } from "../../../../features/post/domain/typeorm/post.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Blogs {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    name: string

    @Column({ nullable: false })
    description: string

    @Column({ nullable: false })
    websiteUrl: string

    @Column('timestamp without time zone', { nullable: false, default: () => 'now()' })
    createdAt: string

    @Column({ nullable: false, default: false })
    isMembership: boolean

    @OneToMany(() => Posts, post => post.blog)
    posts: Posts[]

}