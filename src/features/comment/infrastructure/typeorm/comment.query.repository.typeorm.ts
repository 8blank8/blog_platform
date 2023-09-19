import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostComments } from "../../domain/typeorm/comment.entitty";
import { Repository } from "typeorm";
import { CommentQueryParam } from "../../models/comment.query.param.type";
import { CommentViewSqlModel } from "../sql/models/comment.view.sql.model";
import { PostCommentLike } from "../../domain/typeorm/comment.like.entity";
import { objectKeysMapTypeorm } from "src/entity/mapper/object.keys.map.typeorm";
import { CommentPagniation } from "src/entity/pagination/comment/comment.pagination";


@Injectable()
export class CommentQueryRepositoryTypeorm {
    constructor(
        @InjectRepository(PostComments) private commentRepository: Repository<PostComments>,
        @InjectRepository(PostCommentLike) private commentLikeRepository: Repository<PostCommentLike>
    ) { }

    async findCommentsViewByPostId(queryParam: CommentQueryParam, postId: string, userId?: string) {

        const pagination = new CommentPagniation(queryParam).getCommentPaginationForSql()
        const { sortBy, sortDirection, offset, pageNumber, pageSize } = pagination

        const comments = await this.commentRepository.createQueryBuilder('c')
            .addSelect((subquery) => {
                return subquery.select('COUNT(*) as "likesCount"').from(PostCommentLike, 'cl').where(`cl.likeStatus = 'Like'`)
            })
            .addSelect((subquery) => {
                return subquery.select('COUNT(*) as "dislikesCount"').from(PostCommentLike, 'cl').where(`cl.likeStatus = 'Dislike'`)
            })
            .addSelect((subquery) => {
                return subquery.select('cl.likeStatus').from(PostCommentLike, 'cl').where(`cl.id = c.id`).andWhere('cl."userId" = :userId', { userId: userId ?? null })
            })
            .addSelect('u.login')
            .leftJoin('c.post', 'p')
            .leftJoin('c.user', 'u')
            .where('p.id = :postId', { postId })
            .orderBy(`c."${sortBy}" ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'}`, sortDirection)
            .offset(offset)
            .limit(pageSize)
            .getRawMany()

        const totalCount = await this.commentRepository.createQueryBuilder('c')
            .where('p.id = :postId', { postId })
            .leftJoin('c.post', 'p')
            .getCount()

        const commentsKeyMap = objectKeysMapTypeorm(comments)

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: commentsKeyMap.map(this._mapCommentView)
        }
    }

    async findCommentViewById(commentId: string, userId?: string): Promise<CommentViewSqlModel | null> {
        const comment = await this.commentRepository.createQueryBuilder('c')
            .addSelect((subquery) => {
                return subquery.select('COUNT(*) as "likesCount"').from(PostCommentLike, 'cl').where(`cl.likeStatus = 'Like'`)
            })
            .addSelect((subquery) => {
                return subquery.select('COUNT(*) as "dislikesCount"').from(PostCommentLike, 'cl').where(`cl.likeStatus = 'Dislike'`)
            })
            .addSelect((subquery) => {
                return subquery.select('cl.likeStatus').from(PostCommentLike, 'cl').where(`cl.id = c.id`).andWhere('cl."userId" = :userId', { userId: userId ?? null })
            })
            .addSelect('u.login')
            .leftJoin('c.user', 'u')
            .where('c.id = :commentId', { commentId })
            .getRawMany()

        if (!comment) return null

        const commentKeysMap = objectKeysMapTypeorm(comment)

        return commentKeysMap.map(this._mapCommentView)[0]
    }

    async findCommentEntityById(commentId: string): Promise<PostComments | null> {
        return this.commentRepository.createQueryBuilder('c')
            .where('c.id = :commentId', { commentId })
            .leftJoinAndSelect('c.user', 'u')
            .getOne()
    }

    async findLikeCommentById(commentId: string, userId: string): Promise<PostCommentLike | null> {
        return this.commentLikeRepository.createQueryBuilder('pl')
            .where('u.id = :userId', { userId })
            .andWhere('pl.id = :commentId', { commentId })
            .leftJoin('pl.comment', 'c')
            .leftJoin('pl.user', 'u')
            .getOne()
    }

    _mapCommentView(comment): CommentViewSqlModel {
        return {
            id: comment.id,
            content: comment.content,
            commentatorInfo: {
                userId: comment.userId,
                userLogin: comment.login
            },
            createdAt: comment.createdAt,
            likesInfo: {
                likesCount: +comment.likesCount,
                dislikesCount: +comment.dislikesCount,
                myStatus: comment.likeStatus ?? 'None'
            }
        }
    }
}