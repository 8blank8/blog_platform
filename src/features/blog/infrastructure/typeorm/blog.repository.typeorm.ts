import { BlogBan } from '@blog/domain/typeorm/blog.ban.entity';
import { Blogs } from '@blog/domain/typeorm/blog.entity';
import { BlogImage } from '@blog/domain/typeorm/blog.image';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BlogRepositoryTypeorm {
  constructor(
    @InjectRepository(Blogs) private blogRepository: Repository<Blogs>,
    @InjectRepository(BlogBan) private blogBanRepository: Repository<BlogBan>,
    @InjectRepository(BlogImage) private blogImageRepository: Repository<BlogImage>,
  ) { }

  async saveBlog(blog: Blogs) {
    return this.blogRepository.save(blog);
  }

  async deleteBlogById(blogId: string) {
    return this.blogRepository.delete({ id: blogId });
  }

  async saveBanBlog(bannedBlog: BlogBan) {
    return this.blogBanRepository.save(bannedBlog)
  }

  async saveImage(image: BlogImage) {
    return this.blogImageRepository.save(image)
  }
}
