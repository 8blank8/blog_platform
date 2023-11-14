import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { BlogController } from './api/blog.controller';
import { BloggerUserController } from './api/blogger.user.controller';
import { BlogService } from './application/blog.service';
import { DeletePostByBlogIdUseCase } from './application/useCases/delete.post.by.blog.id.use.case';
import { UpdatePostByBlogIdUseCase } from './application/useCases/update.post.by.blog.id.use.case';
import { CreateBlogUseCase } from './application/useCases/create.blog.use.case';
import { UpdateBlogUseCase } from './application/useCases/update.blog.use.case';
import { DeleteBlogUseCase } from './application/useCases/delete.blog.use.case';
import { BanUserForBlogUseCase } from './application/useCases/ban.user.for.blog.use.case';
import {
  UserBanBlog,
  UserBanBlogSchema,
} from './domain/mongoose/user.ban.blog.schema';
import { Blog, BlogSchema } from './domain/mongoose/blog.schema';
import { Blogs } from './domain/typeorm/blog.entity';
import { BlogQueryRepository } from './infrastructure/mongo/blog.query.repository';
import { BlogRepository } from './infrastructure/mongo/blog.repository';
import { UserBanBlogRepository } from './infrastructure/mongo/user.ban.blog.repository';
import { UserBanBlogQueryRepository } from './infrastructure/mongo/user.ban.blog.query.repository';
import { BlogRepositorySql } from './infrastructure/sql/blog.repository.sql';
import { BlogQueryRepositorySql } from './infrastructure/sql/blog.query.repository.sql';
import { UserBanBlogQueryRepositorySql } from './infrastructure/sql/user.ban.blog.query.repository.sql';
import { UserBanBlogRepositorySql } from './infrastructure/sql/user.ban.blog.repository.sql';
import { BlogRepositoryTypeorm } from './infrastructure/typeorm/blog.repository.typeorm';
import { BlogQueryRepositoryTypeorm } from './infrastructure/typeorm/blog.query.repository.typeorm';
import { PostModule } from '../post/post.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: UserBanBlog.name, schema: UserBanBlogSchema },
      { name: Blog.name, schema: BlogSchema },
    ]),
    TypeOrmModule.forFeature([Blogs]),
    UserModule,
    forwardRef(() => PostModule),
  ],
  controllers: [BlogController, BloggerUserController],
  providers: [
    BlogService,
    DeletePostByBlogIdUseCase,
    UpdatePostByBlogIdUseCase,
    CreateBlogUseCase,
    UpdateBlogUseCase,
    DeleteBlogUseCase,
    BanUserForBlogUseCase,

    BlogRepository,
    BlogQueryRepository,
    UserBanBlogRepository,
    UserBanBlogQueryRepository,

    BlogRepositorySql,
    BlogQueryRepositorySql,
    UserBanBlogQueryRepositorySql,
    UserBanBlogRepositorySql,

    BlogRepositoryTypeorm,
    BlogQueryRepositoryTypeorm,
  ],
  exports: [
    BlogRepositoryTypeorm,
    BlogQueryRepositoryTypeorm,
    BlogRepository,
    BlogQueryRepository,
    BlogRepositorySql,
    BlogQueryRepositorySql,
  ],
})
export class BlogModule {}
