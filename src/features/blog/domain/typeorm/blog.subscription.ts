import { Users } from "@user/domain/typeorm/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Blogs } from "./blog.entity";
import { UserTelegramProfile } from "@user/domain/typeorm/user.telegram.profile.entity";


@Entity()
export class BlogSubscription {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ default: 'None' })
    currentUserSubscriptionStatus: 'Subscribed' | 'Unsubscribed' | 'None'

    @ManyToOne(() => Users, user => user.id)
    user: Users

    @ManyToOne(() => Blogs, blog => blog.id)
    blog: Blogs

    @ManyToOne(() => UserTelegramProfile, profile => profile.id, { nullable: true })
    telegramProfile: UserTelegramProfile
}