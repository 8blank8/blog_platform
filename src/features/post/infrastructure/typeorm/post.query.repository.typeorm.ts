import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from '@post/domain/typeorm/post.entity';
import { PostImage } from '@post/domain/typeorm/post.image.entity';
import { PostLikes } from '@post/domain/typeorm/post.like.entity';
import { PostQueryParamType } from '@post/models/post.query.param.type';
import { PostViewSqlModel } from '@post/models/post.view.sql.model';
import { PostPagniation } from '@utils/pagination/post/post.pagination';
import { Repository } from 'typeorm';

@Injectable()
export class PostQueryRepositoryTypeorm {
  constructor(
    @InjectRepository(Posts) private postRepository: Repository<Posts>,
    @InjectRepository(PostLikes)
    private postLikesRepository: Repository<PostLikes>,
    @InjectRepository(PostImage) private postImageRepository: Repository<PostImage>,
  ) { }

  async findFullPostById(postId: string): Promise<Posts | null> {
    return this.postRepository
      .createQueryBuilder('p')
      .where('p.id = :postId', { postId })
      .leftJoinAndSelect('p.blog', 'b')
      .getOne();
  }

  async findPostByIdForPublic(
    postId: string,
    userId?: string,
  ): Promise<PostViewSqlModel | null> {
    const post = await this.postRepository
      .createQueryBuilder('p')
      .select(
        'p.id, p.title, p.shortDescription, p.content, b.id as "blogId", b.name as "blogName", p."createdAt"',
      )
      .addSelect((subquery) => {
        return subquery
          .select('pl.likeStatus as "myStatus"')
          .from(PostLikes, 'pl')
          .where(`pl."postId" = p.id`)
          .andWhere('pl."userId" = :userId', { userId: userId ?? null });
      })
      .addSelect((subquery) => {
        return subquery
          .select('COUNT(*) as "likesCount"')
          .from(PostLikes, 'pl')
          .leftJoin('pl.user', 'user')
          .leftJoin('user.banInfo', 'ban')
          .where(`pl.likeStatus = 'Like' AND pl."postId" = p.id AND ban.isBanned = false`);
      })
      .addSelect((subquery) => {
        return subquery
          .select('COUNT(*) as "dislikesCount"')
          .from(PostLikes, 'pl')
          .leftJoin('pl.user', 'user')
          .leftJoin('user.banInfo', 'ban')
          .where(`pl.likeStatus = 'Dislike' AND pl."postId" = p.id AND ban.isBanned = false`);
      })
      .addSelect(
        `(SELECT ARRAY(
                SELECT json_build_object(
                    'addedAt', pl."addedAt", 
                    'userId', pl."userId", 
                    'login', (
                        SELECT u."login" FROM "users" as u 
                        WHERE u."id" = pl."userId"
                )) FROM "post_likes" as pl 
                LEFT JOIN "users" as u ON pl."userId" = u."id"
                LEFT JOIN "user_banned" as ban ON u."id" = ban."userId"
                WHERE p."id" = pl."postId" AND pl."likeStatus" = 'Like' AND ban."isBanned" = false
                ORDER BY pl."addedAt" 
                DESC LIMIT 3
            ))`,
        'newestLikes',
      )
      .addSelect(
        `(SELECT ARRAY(
              SELECT json_build_object(
                'url', image."url", 
                'width', image."width",
                'height', image."height", 
                'fileSize', image."fileSize"
              ) FROM "post_image" as image
              WHERE image."postId" = p."id"
        ))`,
        'images'
      )
      .leftJoin('p.blog', 'b')
      .leftJoin('p.user', 'user')
      .leftJoin('user.banInfo', 'ban')
      .where('ban.isBanned = false')
      .andWhere('b.isBanned = false')
      .andWhere('p.id = :postId', { postId })
      .getRawOne();

    if (!post) return null;

    return this._mapPostView(post);
  }

  async findPostByBlogForBlogger(
    blogId: string,
    queryParam: PostQueryParamType,
    userId?: string,
  ) {
    const pagination = new PostPagniation(queryParam).getPostPaginationForSql();
    const { sortBy, sortDirection, pageNumber, pageSize, offset } = pagination;

    const posts = await this.postRepository
      .createQueryBuilder('p')
      .select(
        'p.id, p.title, p.shortDescription, p.content, b.id as "blogId", b.name as "blogName", p."createdAt"',
      )
      .addSelect((subquery) => {
        return subquery
          .select('pl.likeStatus as "myStatus"')
          .from(PostLikes, 'pl')
          .where(`pl."postId" = p.id`)
          .andWhere('pl."userId" = :userId', { userId: userId ?? null });
      })
      .addSelect((subquery) => {
        return subquery
          .select('COUNT(*) as "likesCount"')
          .from(PostLikes, 'pl')
          .where(`pl.likeStatus = 'Like' AND pl."postId" = p.id`);
      })
      .addSelect((subquery) => {
        return subquery
          .select('COUNT(*) as "dislikesCount"')
          .from(PostLikes, 'pl')
          .where(`pl.likeStatus = 'Dislike' AND pl."postId" = p.id`);
      })
      .addSelect(
        `(SELECT ARRAY(
                SELECT json_build_object(
                    'addedAt', pl."addedAt", 
                    'userId', pl."userId", 
                    'login', (
                        SELECT u."login" FROM "users" as u 
                        WHERE u."id" = pl."userId"
                )) FROM "post_likes" as pl 
                WHERE p."id" = pl."postId" AND pl."likeStatus" = 'Like' 
                ORDER BY pl."addedAt" 
                DESC LIMIT 3
            ))`,
        'newestLikes',
      )
      .addSelect(
        `(SELECT ARRAY(
              SELECT json_build_object(
                'url', image."url", 
                'width', image."width",
                'height', image."height", 
                'fileSize', image."fileSize"
              ) FROM "post_image" as image
              WHERE image."postId" = p."id"
        ))`,
        'images'
      )
      .leftJoin('p.blog', 'b')
      .where('b.id = :blogId', { blogId })
      .orderBy(
        `${sortBy === 'blogName' ? `b."name"` : `p."${sortBy}"`} ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'
        }`,
        sortDirection,
      )
      .offset(offset)
      .limit(pageSize)
      .getRawMany();

    const totalCount = await this.postRepository
      .createQueryBuilder('p')
      .where('b.id = :blogId', { blogId })
      .leftJoin('p.blog', 'b')
      .getCount();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: posts.map(this._mapPostView),
    };
  }

  async findPostsForPublic(queryParam: PostQueryParamType, userId?: string) {
    const pagination = new PostPagniation(queryParam).getPostPaginationForSql();
    const { sortBy, sortDirection, pageNumber, pageSize, offset } = pagination;

    const posts = await this.postRepository
      .createQueryBuilder('p')
      .select(
        'p.id, p.title, p.shortDescription, p.content, b.id as "blogId", b.name as "blogName", p."createdAt"',
      )
      .addSelect((subquery) => {
        return subquery
          .select('pl.likeStatus as "myStatus"')
          .from(PostLikes, 'pl')
          .where(`pl."postId" = p.id`)
          .andWhere('pl."userId" = :userId', { userId: userId ?? null });
      })
      .addSelect((subquery) => {
        return subquery
          .select('COUNT(*) as "likesCount"')
          .from(PostLikes, 'pl')
          .leftJoin('pl.user', 'user')
          .leftJoin('user.banInfo', 'ban')
          .where(`pl.likeStatus = 'Like' AND pl."postId" = p.id AND ban.isBanned = false`);
      })
      .addSelect((subquery) => {
        return subquery
          .select('COUNT(*) as "dislikesCount"')
          .from(PostLikes, 'pl')
          .leftJoin('pl.user', 'user')
          .leftJoin('user.banInfo', 'ban')
          .where(`pl.likeStatus = 'Dislike' AND pl."postId" = p.id AND ban.isBanned = false`);
      })
      .addSelect(
        `(SELECT ARRAY(
                    SELECT json_build_object(
                        'addedAt', pl."addedAt", 
                        'userId', pl."userId", 
                        'login', (
                            SELECT u."login" FROM "users" as u 
                            WHERE u."id" = pl."userId"
                    )) FROM "post_likes" as pl 
                    LEFT JOIN "users" as u ON pl."userId" = u."id"
                    LEFT JOIN "user_banned" as ban ON u."id" = ban."userId"
                    WHERE p."id" = pl."postId" AND pl."likeStatus" = 'Like' AND ban."isBanned" = false
                    ORDER BY pl."addedAt" 
                    DESC LIMIT 3
                ))`,
        'newestLikes',
      )
      .leftJoin('p.blog', 'b')
      .orderBy(
        `${sortBy === 'blogName' ? `b."name"` : `p."${sortBy}"`} ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'
        }`,
        sortDirection,
      )
      .leftJoin('p.user', 'user')
      .leftJoin('user.banInfo', 'ban')
      .where('ban.isBanned = false')
      .offset(offset)
      .limit(pageSize)
      .getRawMany();

    const totalCount = await this.postRepository
      .createQueryBuilder('p')
      .leftJoin('p.user', 'user')
      .leftJoin('user.banInfo', 'ban')
      .where('ban.isBanned != true')
      .getCount();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: posts.map(this._mapPostView),
    };
  }

  async findLikeStatusPost(
    userId: string,
    postId: string,
  ): Promise<PostLikes | null> {
    return this.postLikesRepository
      .createQueryBuilder('pl')
      .where('u.id = :userId', { userId })
      .andWhere('p.id = :postId', { postId })
      .leftJoin('pl.post', 'p')
      .leftJoin('pl.user', 'u')
      .getOne();
  }

  async findPostImageByBlogId(postId: string) {
    const postImage = await this.postImageRepository.createQueryBuilder('i')
      .where('i."postId" = :postId', { postId })
      .getMany()

    return {
      main: postImage.map(image => this._mapPostImage(image))
    }
  }

  private _mapPostImage(image: PostImage) {
    return {
      fileSize: image.fileSize,
      height: image.height,
      url: String(process.env.S3_VIEW_URL) + image.url,
      width: image.width
    }
  }

  _mapPostView(post): PostViewSqlModel {
    const newestLikes = post.newestLikes.map((like) => {
      return {
        addedAt: new Date(like.addedAt).toISOString(),
        userId: like.userId,
        login: like.login,
      };
    });

    let images: any = { main: [] }
    if (post.images.length !== 0) {
      images.main = post.images.map(image => {
        return {
          fileSize: image.fileSize,
          height: image.height,
          url: String(process.env.S3_VIEW_URL) + image.url,
          width: image.width
        }
      })
    }

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: +post.likesCount,
        dislikesCount: +post.dislikesCount,
        myStatus: post.myStatus ?? 'None',
        newestLikes: newestLikes,
      },
      images: images
    };
  }
}
