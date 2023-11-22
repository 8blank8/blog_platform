import { BlogBanUser } from "@blog/domain/typeorm/blog.ban.user.entity";
import { BannedUserViewModel } from "@blog/models/banned.user.view.model";
import { UsersBanQueryParamModel } from "@blog/models/users.ban.query.param.model";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogBanUserPagination } from "@utils/pagination/blog/blog.ban.user.pagination";
import { Repository } from "typeorm";


@Injectable()
export class UserBlogBanQueryRepositoryTypeorm {
    constructor(@InjectRepository(BlogBanUser) private blogBanRepository: Repository<BlogBanUser>) { }

    async findBannedUserForBlog(userId: string, blogId: string): Promise<BlogBanUser | null> {
        const banBlogInfo = await this.blogBanRepository.createQueryBuilder('b')
            .where(`b."userId" = :userId`, { userId })
            .andWhere(`b."blogId" = :blogId`, { blogId })
            .leftJoinAndSelect('b.user', 'u')
            .leftJoinAndSelect('b.blog', 'blog')
            .getOne()

        return banBlogInfo
    }

    async findBannedUsers(blogId: string, queryParam: UsersBanQueryParamModel) {
        const pagination = new BlogBanUserPagination(queryParam).getBlogBanUserPaginationForSql()
        const {
            searchLoginTerm,
            sortBy,
            sortDirection,
            pageNumber,
            pageSize,
            offset
        } = pagination

        const users = await this.blogBanRepository.createQueryBuilder('u')
            .where('u."blogId" = :blogId', { blogId })
            .andWhere('user.login ILIKE :searchLoginTerm', { searchLoginTerm })
            .andWhere('u.isBanned = true')
            .leftJoinAndSelect('u.user', 'user')
            .orderBy(
                `user.${sortBy} ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'}`,
                sortDirection,
            )
            .offset(+offset)
            .limit(+pageSize)
            .getMany();

        const totalCount = await this.blogBanRepository.createQueryBuilder('u')
            .where('u."blogId" = :blogId', { blogId })
            .andWhere('user.login ILIKE :searchLoginTerm', { searchLoginTerm })
            .leftJoin('u.user', 'user')
            .getCount()

        return {
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCount,
            items: users.map(user => this._mapUser(user))
        }
    }

    private _mapUser(blogBanUser: BlogBanUser): BannedUserViewModel {
        return {
            id: blogBanUser.user.id,
            login: blogBanUser.user.login,
            banInfo: {
                isBanned: blogBanUser.isBanned,
                banDate: blogBanUser.banDate,
                banReason: blogBanUser.banReason
            }
        }
    }
}