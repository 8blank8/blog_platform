import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Blog, BlogDocument } from '../../blog/domain/mongoose/blog.schema';
import { BlogViewModel } from './models/blog.view.model';
import { User, UserDocument } from '../../user/domain/mongoose/user.schema';
import { QUERY_PARAM } from '../../../utils/enum/query.param.enum';
import { BlogQueryParamModel } from './models/blog.query.param';

@Injectable()
export class SaQueryRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAllBlogs(queryParam: BlogQueryParamModel) {
    const {
      searchNameTerm = QUERY_PARAM.SEARCH_NAME_TERM,
      pageNumber = QUERY_PARAM.PAGE_NUMBER,
      pageSize = QUERY_PARAM.PAGE_SIZE,
      sortBy = QUERY_PARAM.SORT_BY,
      sortDirection = QUERY_PARAM.SORT_DIRECTION_DESC,
    } = queryParam;

    const filter: any = {};

    if (searchNameTerm) {
      const filterName = new RegExp(`${searchNameTerm}`, 'i');
      filter.name = { $regex: filterName };
    }

    const blogs = await this.blogModel
      .find(filter)
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize)
      .sort({ [sortBy]: sortDirection })
      .exec();

    const totalCount = await this.blogModel.countDocuments(filter);

    return {
      pagesCount: Math.ceil(totalCount / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: await Promise.all(blogs.map((item) => this._mapBlog(item))),
    };
  }

  async _mapBlog(blog: BlogDocument): Promise<BlogViewModel | null> {
    const user = await this.userModel.findOne({ id: blog.userId });
    if (!user) return null;

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      isMembership: blog.isMembership,
      createdAt: blog.createdAt,
      blogOwnerInfo: {
        userId: user.id,
        userLogin: user.login,
      },
      banInfo: {
        isBanned: blog.isBanned,
        banDate: blog.banDate,
      },
    };
  }
}
