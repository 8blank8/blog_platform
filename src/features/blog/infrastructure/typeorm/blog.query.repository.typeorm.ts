import { BlogBan } from '@blog/domain/typeorm/blog.ban.entity';
import { Blogs } from '@blog/domain/typeorm/blog.entity';
import { BlogImage } from '@blog/domain/typeorm/blog.image';
import { BlogSubscription } from '@blog/domain/typeorm/blog.subscription';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogQueryParamModel } from '@sa/models/blog.query.param';
import { BlogPagination } from '@utils/pagination/blog/blog.pagination';
import { join } from 'node:path';
import { Repository } from 'typeorm';

@Injectable()
export class BlogQueryRepositoryTypeorm {
  constructor(
    @InjectRepository(Blogs) private blogRepository: Repository<Blogs>,
    @InjectRepository(BlogBan) private blogBanRepository: Repository<BlogBan>,
    @InjectRepository(BlogImage) private blogImageRepository: Repository<BlogImage>,
    @InjectRepository(BlogSubscription) private blogSubscriptionRepository: Repository<BlogSubscription>,
  ) { }
  // TODO: написать тесты для подписки, не работает получения статуса подсписки пользователя
  async findBlogViewById(blogId: string, userId?: string) {
    const blog = await this.blogRepository
      .createQueryBuilder('b')
      .select(`
      b.id, b.name, b.description,
       b.websiteUrl, b.createdAt, b.isMembership,
       b."subscribersCount", s."currentUserSubscriptionStatus" as "subscriptionStatus",
       ARRAY[
        jsonb_build_object(
          'url', image."url", 
          'width', image."width",
          'height', image."height", 
          'fileSize', image."fileSize",
          'title', image."title"
        )
    ] as images
       `)
      .leftJoin('b.subscriptions', 's', 's."userId" = :userId', { userId })
      .where('b.id = :blogId AND b.isBanned = false', { blogId })
      // .leftJoin('b.banInfo', 'ban')
      .leftJoin('b.images', 'image',)
      .getRawOne();
    if (!blog) return null

    return this._mapBlogView(blog)
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
      items: blogs.map(blog => this._mapBlogView(blog)),
    };
  }

  async findAllBlogsView(queryParam: BlogQueryParamModel, userId: string) {
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
      .select(`
      b.id, b.name, b.description,
       b.websiteUrl, b.createdAt, b.isMembership,
       b."subscribersCount", s."currentUserSubscriptionStatus" as "subscriptionStatus",
       ARRAY[
        jsonb_build_object(
          'url', image."url", 
          'width', image."width",
          'height', image."height", 
          'fileSize', image."fileSize",
          'title', image."title"
        )
    ] as images
       `)
      .where('b.isBanned = false')
      .andWhere('name ILIKE :searchNameTerm', { searchNameTerm })
      .leftJoin('b.images', 'image')
      .leftJoin('b.subscriptions', 's', 's."userId" = :userId', { userId })
      // .leftJoin('b.banInfo', 'ban')
      .orderBy(
        `"${sortBy}" ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'}`,
        sortDirection,
      )
      .offset(offset)
      .limit(pageSize)
      .getRawMany();

    const totalCount = await this.blogRepository
      .createQueryBuilder('b')
      .where('name ILIKE :searchNameTerm', { searchNameTerm })
      .andWhere('b.isBanned = false')
      // .leftJoin('b.banInfo', 'ban')
      .getCount();


    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: blogs.map(blog => this._mapBlogView(blog)),
    };
  }

  async findFullBlogById(blogId: string): Promise<Blogs | null> {
    const blog = await this.blogRepository.createQueryBuilder('b')
      .where('b.id = :blogId', { blogId })
      .leftJoinAndSelect('b.user', 'u')
      .getOne()

    return blog
  }

  // async findBannedBlogById(blogId: string): Promise<BlogBan | null> {
  //   const bannedBlog = await this.blogBanRepository.createQueryBuilder('b')
  //     .where('b."blogId" = :blogId', { blogId })
  //     .getOne()

  //   return bannedBlog
  // }

  async findBlogImagesByBlogId(blogId: string) {
    const blogImages = await this.blogImageRepository.createQueryBuilder('i')
      .where('i."blogId" = :blogId', { blogId })
      .getMany()

    console.log(this._mapBlogImages(blogImages))
    return this._mapBlogImages(blogImages)
  }

  async findSubscriptionsByBlogId(blogId: string): Promise<BlogSubscription[]> {
    const subscriptions = await this.blogSubscriptionRepository.createQueryBuilder('s')
      .where('s."blogId" = :blogId', { blogId })
      .leftJoinAndSelect('s.telegramProfile', 'tp')
      .getMany()

    return subscriptions
  }

  async findSubscriptiosWithTelegramProfile(blogId: string): Promise<{ telegramId: string; }[]> {
    const telegramIds = await this.blogSubscriptionRepository.createQueryBuilder('s')
      .select('tp."telegramId" as "telegramId"')
      .where(`s."blogId" = :blogId AND tp."telegramId" is not null AND s."currentUserSubscriptionStatus" = 'Subscribed'`, { blogId })
      .leftJoin('s.telegramProfile', 'tp')
      .getRawMany()

    return telegramIds
  }

  async findOneSubscriptionByUserId(blogId: string, userId: string): Promise<BlogSubscription | null> {
    const subscription = await this.blogSubscriptionRepository.createQueryBuilder('s')
      .where('s."blogId" = :blogId AND s."userId" = :userId', { blogId, userId })
      // .leftJoinAndSelect('u.telegramProfile', 'tp')
      .getOne()

    if (!subscription) return null

    return subscription
  }

  private _mapBlogImages(blogImages: BlogImage[]) {
    let wallpaper: any = null
    let main: Array<any> = []

    // TODO: отправлять url без экранирования
    blogImages.forEach(blogImage => {
      const imageDto = {
        url: String(process.env.S3_VIEW_URL) + blogImage.url,
        width: blogImage.width,
        height: blogImage.height,
        fileSize: blogImage.fileSize
      }
      if (blogImage.title === 'wallpaper') {
        wallpaper = imageDto
      } else {
        main.push(imageDto)
      }
    })

    return {
      wallpaper: wallpaper,
      main: main
    }
  }

  private _mapBlogView(blog) {
    let wallpaper: any = null
    let main: Array<any> = []

    // TODO: отправлять url без экранирования
    if (blog.images) {
      blog.images.forEach(image => {
        const imageDto = {
          url: String(process.env.S3_VIEW_URL) + image.url,
          width: image.width,
          height: image.height,
          fileSize: image.fileSize
        }
        if (image.title === 'wallpaper') {
          wallpaper = imageDto
        }
        if (image.title === 'main') {
          main.push(imageDto)
        }
      });
    }

    return {
      id: blog.id,
      description: blog.description,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      name: blog.name,
      websiteUrl: blog.websiteUrl,
      images: {
        wallpaper: wallpaper,
        main: main
      },
      currentUserSubscriptionStatus: blog.subscriptionStatus ?? 'None',
      subscribersCount: blog.subscribersCount
    }
  }
}
