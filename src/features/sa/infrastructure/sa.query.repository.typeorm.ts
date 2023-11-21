import { Blogs } from "@blog/domain/typeorm/blog.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BlogQueryParamModel } from "@sa/models/blog.query.param";
import { BlogViewModel } from "@sa/models/blog.view.model";
import { BlogPagination } from "@utils/pagination/blog/blog.pagination";
import { Repository } from "typeorm";


@Injectable()
export class SaQueryRepositoryTypeorm {
    constructor(@InjectRepository(Blogs) private blogRepository: Repository<Blogs>) { }

    async findBlogsForSa(queryParam: BlogQueryParamModel) {
        const pagination = new BlogPagination(queryParam).getBlogPaginationForSql()
        const { pageNumber, pageSize, offset, searchNameTerm, sortBy, sortDirection } = pagination

        const blogs = await this.blogRepository.createQueryBuilder('b')
            .where('name ILIKE :searchNameTerm', { searchNameTerm })
            .leftJoin('b.user', 'u')
            .addSelect(['u.id', 'u.login'])
            .orderBy(
                `b."${sortBy}" ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'}`,
                sortDirection,
            )
            .offset(offset)
            .limit(pageSize)
            .getMany();

        const totalCount = await this.blogRepository.createQueryBuilder('b')
            .where('name ILIKE :searchNameTerm', { searchNameTerm })
            .getCount()

        return {
            totalCount: totalCount,
            pagesCount: Math.ceil(totalCount / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            items: blogs.map(blog => this._mapBlogForSa(blog))
        }
    }

    private _mapBlogForSa(blog: Blogs): BlogViewModel {
        return {
            id: blog.id,
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: blog.createdAt,
            isMembership: blog.isMembership,
            blogOwnerInfo: {
                userId: blog.user.id,
                userLogin: blog.user.login
            }
        }
    }
}