import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Posts } from "../../domain/typeorm/post.entity";
import { Repository } from "typeorm";
import { PostViewSqlModel } from "../sql/models/post.view.sql.model";
import { PostPagniation } from "../../../../entity/pagination/post/post.pagination";
import { PostQueryParamType } from "../../models/post.query.param.type";


@Injectable()
export class PostQueryRepositoryTypeorm {
    constructor(@InjectRepository(Posts) private postRepository: Repository<Posts>) { }

    async findFullPostById(postId: string): Promise<Posts | null> {
        return this.postRepository.createQueryBuilder('p')
            .where('p.id = :postId', { postId })
            .leftJoinAndSelect('p.blog', 'b')
            .getOne()
    }

    async findPostByIdForPublic(postId: string): Promise<PostViewSqlModel | null> {
        const post = await this.postRepository.createQueryBuilder('p')
            .leftJoinAndSelect('p.postLikes', 'pl')
            .leftJoinAndSelect('p.postComments', 'pc')
            .leftJoinAndSelect('p.blog', 'b')
            .where('p.id = :postId', { postId })
            .getOne()

        if (!post) return null

        return this._mapPostView(post)
    }

    async findPostByBlogForBlogger(blogId: string, queryParam: PostQueryParamType) {

        const pagination = new PostPagniation(queryParam).getPostPaginationForSql()
        const { sortBy, sortDirection, pageNumber, pageSize, offset } = pagination

        const posts = await this.postRepository.createQueryBuilder('p')
            .leftJoinAndSelect('p.postLikes', 'pl')
            .leftJoinAndSelect('p.postComments', 'pc')
            .leftJoinAndSelect('p.blog', 'b')
            .where('b.id = :blogId', { blogId })
            .orderBy(`${sortBy === 'blogName' ? `b."name"` : `p."${sortBy}"`} ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'}`, sortDirection)
            .offset(offset)
            .limit(pageSize)
            .getMany()

        const totalCount = await this.postRepository.createQueryBuilder('p')
            .where('b.id = :blogId', { blogId })
            .leftJoin('p.blog', 'b')
            .getCount()

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: posts.map(this._mapPostView)
        }
    }

    async findPostsForPublic(queryParam: PostQueryParamType) {
        const pagination = new PostPagniation(queryParam).getPostPaginationForSql()
        let { sortBy, sortDirection, pageNumber, pageSize, offset } = pagination

        const posts = await this.postRepository.createQueryBuilder('p')
            .leftJoinAndSelect('p.postLikes', 'pl')
            .leftJoinAndSelect('p.postComments', 'pc')
            .leftJoinAndSelect('p.blog', 'b')
            .orderBy(`${sortBy === 'blogName' ? `b."name"` : `p."${sortBy}"`} ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'}`, sortDirection)
            .offset(offset)
            .limit(pageSize)
            .getMany()

        const totalCount = await this.postRepository.createQueryBuilder('p')
            .getCount()

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: posts.map(this._mapPostView)
        }
    }

    _mapPostView(post: Posts): PostViewSqlModel {
        return {
            id: post.id,
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blog.id,
            blogName: post.blog.name,
            createdAt: post.createdAt,
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: 'None',
                newestLikes: []
            }
        }
    }
}