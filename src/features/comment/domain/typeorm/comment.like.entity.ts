import { Users } from "../../../../features/user/domain/typeorm/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PostComments } from "./comment.entitty";
import { Posts } from "../../../../features/post/domain/typeorm/post.entity";


@Entity()
export class PostCommentLike {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: false })
    likeStatus: 'Like' | 'Dislike' | 'None'

    @ManyToOne(() => Users, user => user.id)
    user: Users

    @ManyToOne(() => PostComments, postComment => postComment.id)
    comment: PostComments

    // @ManyToOne(() => Posts, post => post.id)
    // post: Posts
}