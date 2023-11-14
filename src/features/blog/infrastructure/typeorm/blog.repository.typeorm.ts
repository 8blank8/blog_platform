import { Blogs } from '@blog/domain/typeorm/blog.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BlogRepositoryTypeorm {
  constructor(
    @InjectRepository(Blogs) private blogRepository: Repository<Blogs>,
  ) {}

  async saveBlog(blog: Blogs) {
    return this.blogRepository.save(blog);
  }

  async deleteBlogById(blogId: string) {
    return this.blogRepository.delete({ id: blogId });
  }
}
