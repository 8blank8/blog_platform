import { Module, forwardRef } from '@nestjs/common';
import { PostControler } from './api/post.controller';
import { PostService } from './application/post.service';
import { CreatePostUseCase } from './application/useCases/create.post.use.case';
import { CreatePostByBlogIdUseCase } from './application/useCases/create.post.by.blog.id.use.case';
import { UpdatePostUseCase } from './application/useCases/update.post.use.case';
import { DeletePostUseCase } from './application/useCases/delete.post.use.case';
import { CreateCommentForPostUseCase } from './application/useCases/create.comment.for.post';
import { UpdateLikeStatusForPostUseCase } from './application/useCases/update.like.status.for.post';
import { UpdateBanPostUseCase } from './application/useCases/update.ban.post.use.case';
import { UpdateBanPostLikeStatusUseCase } from './application/useCases/update.ban.post.like.status.use.case';
import { MongooseModule } from '@nestjs/mongoose';
import { PostLike, PostLikeSchema } from './domain/mongoose/post.like.schema';
import { PostSchema, Post } from './domain/mongoose/post.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posts } from './domain/typeorm/post.entity';
import { PostLikes } from './domain/typeorm/post.like.entity';
import { PostQueryRepository } from './infrastructure/mongo/post.query.repository';
import { PostRepository } from './infrastructure/mongo/post.repository';
import { PostRepositorySql } from './infrastructure/sql/post.repository.sql';
import { PostQueryRepositorySql } from './infrastructure/sql/post.query.repository.sql';
import { PostRepositoryTypeorm } from './infrastructure/typeorm/post.repository.typeorm';
import { PostQueryRepositoryTypeorm } from './infrastructure/typeorm/post.query.repository.typeorm';
import { BlogModule } from '../blog/blog.module';
import { UserModule } from '../user/user.module';
import { CommentModule } from '../comment/comment.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
    TypeOrmModule.forFeature([Posts, PostLikes]),
    UserModule,
    forwardRef(() => BlogModule),
    forwardRef(() => CommentModule),
  ],
  controllers: [PostControler],
  providers: [
    PostService,
    CreatePostUseCase,
    CreatePostByBlogIdUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    CreateCommentForPostUseCase,
    UpdateLikeStatusForPostUseCase,
    UpdateBanPostUseCase,
    UpdateBanPostLikeStatusUseCase,

    PostQueryRepository,
    PostRepository,

    PostRepositorySql,
    PostQueryRepositorySql,

    PostRepositoryTypeorm,
    PostQueryRepositoryTypeorm,
  ],
  exports: [
    PostRepositoryTypeorm,
    PostQueryRepositoryTypeorm,
    PostQueryRepository,
  ],
})
export class PostModule {}
