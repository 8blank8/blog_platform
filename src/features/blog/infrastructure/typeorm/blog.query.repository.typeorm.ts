import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogQueryParamModel } from '@app/features/sa/models/blog.query.param';
import { BlogPagination } from '@app/utils/pagination/blog/blog.pagination';

import { Blogs } from '../../domain/typeorm/blog.entity';

@Injectable()
export class BlogQueryRepositoryTypeorm {
  constructor(
    @InjectRepository(Blogs) private blogRepository: Repository<Blogs>,
  ) {}

  async findBlogViewById(blogId: string): Promise<Blogs | null> {
    return this.blogRepository
      .createQueryBuilder('b')
      .where('id = :blogId', { blogId })
      .getOne();
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
}
