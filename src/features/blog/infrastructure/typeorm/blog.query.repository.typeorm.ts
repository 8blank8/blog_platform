import { Blogs } from '@blog/domain/typeorm/blog.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogQueryParamModel } from '@sa/models/blog.query.param';
import { BlogPagination } from '@utils/pagination/blog/blog.pagination';
import { Repository } from 'typeorm';

@Injectable()
export class BlogQueryRepositoryTypeorm {
  constructor(
    @InjectRepository(Blogs) private blogRepository: Repository<Blogs>,
  ) { }

  async findBlogViewById(blogId: string): Promise<Blogs | null> {
    return this.blogRepository
      .createQueryBuilder('b')
      .where('id = :blogId', { blogId })
      .getOne();
  }

  async findAllBlogsUserView(queryParam: BlogQueryParamModel, userId: string) {
    const pagination = new BlogPagination(queryParam).getBlogPaginationForSql();
    const {
      searchNameTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      offset,
    } = pagination;

    const blogs = await this.blogRepository
      .createQueryBuilder('b')
      .where('name ILIKE :searchNameTerm', { searchNameTerm })
      .andWhere('b."userId" = :userId', { userId })
      .orderBy(
        `"${sortBy}" ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'}`,
        sortDirection,
      )
      .offset(offset)
      .limit(pageSize)
      .getMany();

    const totalCount = await this.blogRepository
      .createQueryBuilder('b')
      .where('name ILIKE :searchNameTerm', { searchNameTerm })
      .andWhere('b."userId" = :userId', { userId })
      .getCount();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }

  async findAllBlogsView(queryParam: BlogQueryParamModel) {
    const pagination = new BlogPagination(queryParam).getBlogPaginationForSql();
    const {
      searchNameTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      offset,
    } = pagination;

    const blogs = await this.blogRepository
      .createQueryBuilder('b')
      .where('name ILIKE :searchNameTerm', { searchNameTerm })
      .orderBy(
        `"${sortBy}" ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'}`,
        sortDirection,
      )
      .offset(offset)
      .limit(pageSize)
      .getMany();

    const totalCount = await this.blogRepository
      .createQueryBuilder('b')
      .where('name ILIKE :searchNameTerm', { searchNameTerm })
      .getCount();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }

  async findFullBlogById(blogId: string): Promise<Blogs | null> {
    const blog = await this.blogRepository.createQueryBuilder('b')
      .where('b.id = :blogId', { blogId })
      .leftJoinAndSelect('b.user', 'u')
      .getOne()

    return blog
  }
}
