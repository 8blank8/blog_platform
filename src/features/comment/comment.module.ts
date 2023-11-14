import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

import { CommentController } from './api/comment.controller';
import { CommentService } from './appication/comment.service';
import { DeleteCommentUseCase } from './appication/useCases/delete.comment.use.case';
import { UpdateCommentUseCase } from './appication/useCases/update.comment.use.case';
import { UpdateLikeStatusCommentUseCase } from './appication/useCases/update.like.status.comment.use.case';
import { UpdateBanCommentUseCase } from './appication/useCases/update.ban.comment.use.case';
import { UpdateBanCommentLikeStatusUseCase } from './appication/useCases/update.ban.comment.like.status.use.case';
import { Comment, CommentSchema } from './domain/mongoose/comment.schema';
import {
  CommentLike,
  CommentLikeSchema,
} from './domain/mongoose/comment.like.schema';
import { PostComments } from './domain/typeorm/comment.entitty';
import { PostCommentLike } from './domain/typeorm/comment.like.entity';
import { CommentRepository } from './infrastructure/mongo/comment.repository';
import { CommentQueryRepository } from './infrastructure/mongo/comment.query.repository';
import { CommentRepositorySql } from './infrastructure/sql/comment.repository.sql';
import { CommentQueryRepositorySql } from './infrastructure/sql/comment.query.repository';
import { CommentQueryRepositoryTypeorm } from './infrastructure/typeorm/comment.query.repository.typeorm';
import { CommentRepositoryTypeorm } from './infrastructure/typeorm/comment.repository.typeorm';
import { UserModule } from '../user/user.module';
import { PostModule } from '../post/post.module';
import { BlogModule } from '../blog/blog.module';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
    TypeOrmModule.forFeature([PostComments, PostCommentLike]),
    UserModule,
    forwardRef(() => PostModule),
    forwardRef(() => BlogModule),
  ],
  controllers: [CommentController],
  providers: [
    CommentService,

    DeleteCommentUseCase,
    UpdateCommentUseCase,
    UpdateLikeStatusCommentUseCase,
    UpdateBanCommentUseCase,
    UpdateBanCommentLikeStatusUseCase,

    CommentRepository,
    CommentQueryRepository,

    CommentRepositorySql,
    CommentQueryRepositorySql,

    CommentQueryRepositoryTypeorm,
    CommentRepositoryTypeorm,
  ],
  exports: [CommentQueryRepositoryTypeorm, CommentRepositoryTypeorm],
})
export class CommentModule {}
