import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../../domain/mongoose/blog.schema';
import { Model } from 'mongoose';
import { BlogCreateType } from '../../models/blog.create.type';

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async createBlog(blog: BlogCreateType) {
    return new this.blogModel(blog);
  }

  async save(blog: BlogDocument) {
    return await blog.save();
  }

  async deleteBlog(id: string) {
    const res = await this.blogModel.deleteOne({ id: id });
    return res.deletedCount === 1;
  }

  async deleteAllData() {
    return this.blogModel.deleteMany({});
  }
}
