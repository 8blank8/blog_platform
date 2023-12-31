import { PostComments } from '@comment/domain/typeorm/comment.entitty';
import { PostCommentLike } from '@comment/domain/typeorm/comment.like.entity';
import { CommentQueryParam } from '@comment/models/comment.query.param.type';
import { CommentViewSqlModel } from '@comment/models/comment.view.sql.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { objectKeysMapTypeorm } from '@utils/mapper/object.keys.map.typeorm';
import { CommentPagniation } from '@utils/pagination/comment/comment.pagination';
import { Repository } from 'typeorm';

@Injectable()
export class CommentQueryRepositoryTypeorm {
  constructor(
    @InjectRepository(PostComments)
    private commentRepository: Repository<PostComments>,
    @InjectRepository(PostCommentLike)
    private commentLikeRepository: Repository<PostCommentLike>,
  ) { }

  async findCommentsViewByPostId(
    queryParam: CommentQueryParam,
    postId: string,
    userId?: string,
  ) {
    const pagination = new CommentPagniation(
      queryParam,
    ).getCommentPaginationForSql();
    const { sortBy, sortDirection, offset, pageNumber, pageSize } = pagination;

    const comments = await this.commentRepository
      .createQueryBuilder('c')
      .addSelect((subquery) => {
        return subquery
          .select('COUNT(*) as "likesCount"')
          .from(PostCommentLike, 'cl')
          .leftJoin('cl.user', 'user')
          .leftJoin('user.banInfo', 'ban')
          .where(`cl.likeStatus = 'Like' AND cl."commentId" = c.id AND ban.isBanned = false`)
      })
      .addSelect((subquery) => {
        return subquery
          .select('COUNT(*) as "dislikesCount"')
          .from(PostCommentLike, 'cl')
          .leftJoin('cl.user', 'user')
          .leftJoin('user.banInfo', 'ban')
          .where(`cl.likeStatus = 'Dislike' AND cl."commentId" = c.id AND ban.isBanned = false`)
      })
      .addSelect((subquery) => {
        return subquery
          .select('cl.likeStatus')
          .from(PostCommentLike, 'cl')
          .where(`cl."commentId" = c.id`)
          .andWhere('cl."userId" = :userId', { userId: userId ?? null });
      })
      .addSelect('u.login')
      .leftJoin('c.post', 'p')
      .leftJoin('c.user', 'u')
      .leftJoin('u.banInfo', 'ban')
      .where('p.id = :postId', { postId })
      .andWhere('ban.isBanned = false')
      .orderBy(
        `c."${sortBy}" ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'}`,
        sortDirection,
      )
      .offset(offset)
      .limit(pageSize)
      .getRawMany();

    const totalCount = await this.commentRepository
      .createQueryBuilder('c')
      .where('p.id = :postId', { postId })
      .leftJoin('c.post', 'p')
      .getCount();

    const commentsKeyMap = objectKeysMapTypeorm(comments);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: commentsKeyMap.map(this._mapCommentView),
    };
  }

  async findCommentViewById(commentId: string, userId?: string) {
    const comment = await this.commentRepository
      .createQueryBuilder('c')
      .addSelect((subquery) => {
        return subquery
          .select('COUNT(*) as "likesCount"')
          .from(PostCommentLike, 'cl')
          .leftJoin('cl.user', 'user')
          .leftJoin('user.banInfo', 'ban')
          .where(`cl.likeStatus = 'Like' AND cl."commentId" = c.id AND ban.isBanned = false`)
      })
      .addSelect((subquery) => {
        return subquery
          .select('COUNT(*) as "dislikesCount"')
          .from(PostCommentLike, 'cl')
          .leftJoin('cl.user', 'user')
          .leftJoin('user.banInfo', 'ban')
          .where(`cl.likeStatus = 'Dislike' AND cl."commentId" = c.id AND ban.isBanned = false`)
      })
      .addSelect((subquery) => {
        return subquery
          .select('cl.likeStatus')
          .from(PostCommentLike, 'cl')
          .where(`cl."commentId" = c.id`)
          .andWhere('cl."userId" = :userId', { userId: userId ?? null });
      })
      .addSelect('u.login')
      .leftJoin('c.user', 'u')
      .leftJoin('u.banInfo', 'ban')
      .where('c.id = :commentId', { commentId })
      .andWhere('ban.isBanned = false')
      .getRawMany();

    if (!comment) return null;

    const commentKeysMap = objectKeysMapTypeorm(comment);

    return commentKeysMap.map(this._mapCommentView)[0];
  }

  async findCommentEntityById(commentId: string): Promise<PostComments | null> {
    return this.commentRepository
      .createQueryBuilder('c')
      .where('c.id = :commentId', { commentId })
      .leftJoinAndSelect('c.user', 'u')
      .getOne();
  }

  async findLikeCommentById(
    commentId: string,
    userId: string,
  ): Promise<PostCommentLike | null> {
    return this.commentLikeRepository
      .createQueryBuilder('pl')
      .where('u.id = :userId', { userId })
      .andWhere('pl."commentId" = :commentId', { commentId })
      .leftJoin('pl.user', 'u')
      .getOne();
  }

  async findAllCommentsBlog(userId: string, queryParam: CommentQueryParam) {
    const pagination = new CommentPagniation(
      queryParam,
    ).getCommentPaginationForSql();
    const { sortBy, sortDirection, offset, pageNumber, pageSize } = pagination;

    const comments = await this.commentRepository
      .createQueryBuilder('c')
      .addSelect((subquery) => {
        return subquery
          .select('COUNT(*) as "likesCount"')
          .from(PostCommentLike, 'cl')
          .leftJoin('cl.user', 'user')
          .leftJoin('user.banInfo', 'ban')
          .where(`cl.likeStatus = 'Like' AND cl."commentId" = c.id AND ban.isBanned = false`)
      })
      .addSelect((subquery) => {
        return subquery
          .select('COUNT(*) as "dislikesCount"')
          .from(PostCommentLike, 'cl')
          .leftJoin('cl.user', 'user')
          .leftJoin('user.banInfo', 'ban')
          .where(`cl.likeStatus = 'Dislike' AND cl."commentId" = c.id AND ban.isBanned = false`)
      })
      .addSelect((subquery) => {
        return subquery
          .select('cl.likeStatus')
          .from(PostCommentLike, 'cl')
          .where(`cl."commentId" = c.id`)
          .andWhere('cl."userId" = :userId', { userId: userId ?? null });
      })
      .addSelect('u.login as "userLogin"')
      .addSelect([
        'p.id as "postId"',
        'p.title as "postTitle"',
        'blog.id as "blogId"',
        'blog.name as "blogName"'
      ])
      .leftJoin('c.post', 'p')
      .leftJoin('c.user', 'u')
      .leftJoin('c.blog', 'blog')
      .leftJoin('u.banInfo', 'ban')
      .where('blog."userId" = :userId', { userId })
      .andWhere('ban.isBanned = false')
      .orderBy(
        `c."${sortBy}" ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'}`,
        sortDirection,
      )
      .offset(offset)
      .limit(pageSize)
      .getRawMany();

    const totalCount = await this.commentRepository
      .createQueryBuilder('c')
      .where('blog."userId" = :userId', { userId })
      .leftJoin('c.blog', 'blog')
      .getCount();

    const commentsKeyMap = objectKeysMapTypeorm(comments);

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: commentsKeyMap.map(comment => this._mapCommentViewForBlogger(comment))
    }
  }
  private _mapCommentViewForBlogger(comment) {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: +comment.likesCount,
        dislikesCount: +comment.dislikesCount,
        myStatus: comment.likeStatus ?? 'None',
      },
      postInfo: {
        id: comment.postId,
        title: comment.postTitle,
        blogId: comment.blogId,
        blogName: comment.blogName
      }
    };
  }

  _mapCommentView(comment): CommentViewSqlModel {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.login,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: +comment.likesCount,
        dislikesCount: +comment.dislikesCount,
        myStatus: comment.likeStatus ?? 'None',
      },
    };
  }
}
