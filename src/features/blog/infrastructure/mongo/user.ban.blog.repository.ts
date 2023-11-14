import {
  UserBanBlog,
  UserBanBlogDocument,
} from '@blog/domain/mongoose/user.ban.blog.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserBanBlogRepository {
  constructor(
    @InjectModel(UserBanBlog.name)
    private userBanBlogModel: Model<UserBanBlogDocument>,
  ) {}

  async save(user: UserBanBlogDocument) {
    return await user.save();
  }

  async findBannedUser(
    userId: string,
    blogId: string,
  ): Promise<UserBanBlogDocument | null> {
    return await this.userBanBlogModel.findOne({
      userId: userId,
      blogId: blogId,
    });
  }

  async createBannedUser(): Promise<UserBanBlogDocument> {
    return new this.userBanBlogModel();
  }
}
