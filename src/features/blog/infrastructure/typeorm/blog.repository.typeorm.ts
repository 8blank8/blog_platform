import { BlogBan } from '@blog/domain/typeorm/blog.ban.entity';
import { Blogs } from '@blog/domain/typeorm/blog.entity';
import { BlogImage } from '@blog/domain/typeorm/blog.image';
import { BlogSubscription } from '@blog/domain/typeorm/blog.subscription';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class BlogRepositoryTypeorm {
  constructor(
    @InjectRepository(Blogs) private blogRepository: Repository<Blogs>,
    @InjectRepository(BlogBan) private blogBanRepository: Repository<BlogBan>,
    @InjectRepository(BlogImage) private blogImageRepository: Repository<BlogImage>,
    @InjectRepository(BlogSubscription) private blogSubscriptionRepository: Repository<BlogSubscription>,
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

  async saveSubscription(subscription: BlogSubscription) {
    return this.blogSubscriptionRepository.save(subscription)
  }

  async deleteSubscription(userId: string, blogId: string) {
    return this.blogSubscriptionRepository.createQueryBuilder()
      .delete()
      .from(BlogSubscription)
      .where('"userId" = :userId', { userId })
      .andWhere('"blogId" = :blogId', { blogId })
      .execute()
  }
}
