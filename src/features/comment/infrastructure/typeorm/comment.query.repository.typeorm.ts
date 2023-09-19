import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostComments } from "../../domain/typeorm/comment.entitty";
import { Repository } from "typeorm";
import { CommentQueryParam } from "../../models/comment.query.param.type";
import { CommentViewSqlModel } from "../sql/models/comment.view.sql.model";


@Injectable()
export class CommentQueryRepositoryTypeorm {
    constructor(@InjectRepository(PostComments) private commentRepository: Repository<PostComments>) { }

    async findCommentsViewByPostId(queryParam: CommentQueryParam, postId: string, userId?: string): Promise<CommentViewSqlModel[]> {

        const comments = await this.commentRepository.createQueryBuilder('c')
            .leftJoin('c.post', 'p')
            .leftJoinAndSelect('c.user', 'u')
            .where('p.id = :postId', { postId })
            .getMany()

        return comments.map(this._mapCommentView)
    }

    _mapCommentView(comment: PostComments): CommentViewSqlModel {
        return {
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: comment.user.id,
                userLogin: comment.user.login
            },
            createdAt: comment.createdAt,
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None'
            }
        }
    }
}