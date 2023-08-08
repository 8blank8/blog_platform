import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from './features/blog/domain/blog.schema';
import { BlogRepository } from './features/blog/infrastructure/blog.repository';
import { BlogController } from './features/blog/api/blog.controller';
import { BlogService } from './features/blog/application/blog.service';
import { BlogQueryRepository } from './features/blog/infrastructure/blog.query.repository';

import { Post, PostSchema } from './features/post/domain/post.schema';
import { PostQueryRepository } from './features/post/infrastructure/post.query.repository';
import { PostControler } from './features/post/api/post.controller';
import { PostService } from './features/post/application/post.service';
import { PostRepository } from './features/post/infrastructure/post.repository';

import { UserController } from './features/user/api/user.controller';
import { UserService } from './features/user/application/user.service';
import { UserRepository } from './features/user/infrastructure/user.repository';
import { UserQueryRepository } from './features/user/infrastructure/user.query.repository';

import { TestingController } from './features/testing/testing.controller';
import { User, UserSchema } from './features/user/domain/user.schema';

import { AuthController } from './features/auth/api/auth.controller';
import { AuthService } from './features/auth/application/auth.service';

import { JwtModule } from '@nestjs/jwt'
import { LocalStrategy } from './features/auth/strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './features/auth/strategies/jwt.strategy';
import { BasicStrategy } from './features/auth/strategies/basic-strategy';

import { EmailAdapter } from './entity/adapters/email.adapter';
import { EmailManager } from './entity/managers/email.manager';
import { UserIsConfirmed } from './features/auth/models/confirmation.code.type';
import { UserExistLogin } from './entity/custom-validation/user.exist.login';
import { UserExistEmail } from './entity/custom-validation/user.exist.email';
import { EmailCodeResend } from './entity/custom-validation/email.code.resend';
import { CommentController } from './features/comment/api/comment.controller';
import { CommentRepository } from './features/comment/infrastructure/comment.repository';
import { CommentQueryRepository } from './features/comment/infrastructure/comment.query.repository';
import { Comment, CommentSchema } from './features/comment/domain/comment.schema';
import { CommentService } from './features/comment/appication/comment.service';
import { CommentLike, CommentLikeSchema } from './features/comment/domain/comment.like.schema';
import { PostLike, PostLikeSchema } from './features/post/domain/post.like.schema';
import { CheckBlogId } from './entity/custom-validation/check.blogId';
import { IsNotBlank } from './entity/custom-validation/is.not.blank';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://blank:admin@cluster0.zmondyt.mongodb.net/?retryWrites=true&w=majority'),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: PostLike.name, schema: PostLikeSchema }
    ]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: '123',
      signOptions: { expiresIn: '5h' }
    })
  ],
  controllers: [AppController, BlogController, PostControler, UserController, AuthController, CommentController, TestingController],
  providers: [
    AppService,
    BlogRepository, BlogService, BlogQueryRepository,
    PostQueryRepository, PostService, PostRepository,
    UserService, UserRepository, UserQueryRepository,
    AuthService,
    LocalStrategy, JwtStrategy, BasicStrategy,
    EmailManager, EmailAdapter,
    UserExistLogin, UserExistEmail, UserIsConfirmed, EmailCodeResend, CheckBlogId, IsNotBlank,
    CommentRepository, CommentQueryRepository, CommentService
  ],
})
export class AppModule { }
