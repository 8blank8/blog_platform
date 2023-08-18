import { ConfigModule } from '@nestjs/config';
const configModule = ConfigModule.forRoot({})

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
import { LikeStatus } from './entity/custom-validation/like.status';
import { Device, DeviceSchema } from './features/security/domain/device.schema';
import { SecurityController } from './features/security/api/security.controller';
import { SecurityQueryRepository } from './features/security/infrastructure/security.query.repository';
import { SecurityService } from './features/security/application/security.service';
import { SecurityRepository } from './features/security/infrastructure/security.repository';
import { JwtRefreshTokenStrategy } from './features/auth/strategies/jwt.refresh.token.straregy';
import { ThrottlerModule } from '@nestjs/throttler';
import { setting_env } from './setting.env';
import { Auth, AuthSchema } from './features/auth/domain/auth.schema';
import { AuthRepository } from './features/auth/infrastructure/auth.repository';
import { AuthQueryRepository } from './features/auth/infrastructure/auth.query.repository';

import { CqrsModule } from '@nestjs/cqrs/dist';

import { CreateBlogUseCase } from './features/blog/application/useCases/create.blog.use.case';
import { UpdateBlogUseCase } from './features/blog/application/useCases/update.blog.use.case';
import { DeleteBlogUseCase } from './features/blog/application/useCases/delete.blog.use.case';
const blogUseCases = [
  CreateBlogUseCase, UpdateBlogUseCase, DeleteBlogUseCase
]


import { DeleteCommentUseCase } from './features/comment/appication/useCases/delete.comment.use.case';
import { UpdateCommentUseCase } from './features/comment/appication/useCases/update.comment.use.case';
import { UpdateLikeStatusCommentUseCase } from './features/comment/appication/useCases/update.like.status.comment.use.case'
const commentUseCase = [
  DeleteCommentUseCase, UpdateCommentUseCase, UpdateLikeStatusCommentUseCase
]


import { CreatePostUseCase } from './features/post/application/useCases/create.post.use.case';
import { CreatePostByBlogIdUseCase } from './features/post/application/useCases/create.post.by.blog.id.use.case';
import { UpdatePostUseCase } from './features/post/application/useCases/update.post.use.case';
import { DeletePostUseCase } from './features/post/application/useCases/delete.post.use.case';
import { CreateCommentForPostUseCase } from './features/post/application/useCases/create.comment.for.post';
import { UpdateLikeStatusForPostUseCase } from './features/post/application/useCases/update.like.status.for.post';
const postUseCase = [
  CreatePostUseCase, CreatePostByBlogIdUseCase, UpdatePostUseCase,
  DeletePostUseCase, CreateCommentForPostUseCase, UpdateLikeStatusForPostUseCase
]


import { CreateDeviceUseCase } from './features/security/application/useCases/create.device.use.case';
import { DeleteDeviceUseCase } from './features/security/application/useCases/delete.device.use.case';
import { DeleteAllDevicesUseCase } from './features/security/application/useCases/delete.all.device.use.case';
const securityUseCase = [
  CreateDeviceUseCase, DeleteDeviceUseCase, DeleteAllDevicesUseCase
]


import { CreateUserUseCase } from './features/user/application/useCases/create.user.use.case';
import { RegistrationUserUseCase } from './features/user/application/useCases/registration.user.use.case';
import { EmailConfirmationUseCase } from './features/user/application/useCases/email.confirmation.use.case';
import { ResendingConfirmationCodeUseCase } from './features/user/application/useCases/resending.confirmation.code.use.case';
import { DeleteUserUseCase } from './features/user/application/useCases/delete.user.use.case';
const userUseCase = [
  CreateUserUseCase, RegistrationUserUseCase, EmailConfirmationUseCase,
  ResendingConfirmationCodeUseCase, DeleteUserUseCase
]


import { ValidateUserUseCase } from './features/auth/application/useCases/validate.user.use.case';
import { LoginUserUseCase } from './features/auth/application/useCases/login.user.use.case';
import { CreateRefreshTokenUseCase } from './features/auth/application/useCases/create.refresh.token.use.case';
import { AddRefreshTokenInBlackListUseCase } from './features/auth/application/useCases/add.refresh.token.in.black.list.use.case';
const authUseCase = [
  ValidateUserUseCase, LoginUserUseCase, CreateRefreshTokenUseCase,
  AddRefreshTokenInBlackListUseCase
]


@Module({
  imports: [
    configModule,
    CqrsModule,
    MongooseModule.forRoot(setting_env.MONGO_URL),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Auth.name, schema: AuthSchema }
    ]),
    ThrottlerModule.forRoot({
      ttl: +setting_env.TTL,
      limit: +setting_env.LIMIT,
    }),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: setting_env.JWT_SECRET,
      signOptions: { expiresIn: setting_env.JWT_ACCESS_EXP }
    })
  ],
  controllers: [AppController, BlogController, PostControler, UserController, AuthController, CommentController, SecurityController, TestingController],
  providers: [
    AppService,
    BlogRepository, BlogService, BlogQueryRepository,
    PostQueryRepository, PostService, PostRepository,
    UserService, UserRepository, UserQueryRepository,
    AuthService, AuthRepository, AuthQueryRepository,
    LocalStrategy, JwtStrategy, BasicStrategy, JwtRefreshTokenStrategy,
    EmailManager, EmailAdapter,
    UserExistLogin, UserExistEmail, UserIsConfirmed, EmailCodeResend, CheckBlogId, IsNotBlank, LikeStatus,
    CommentRepository, CommentQueryRepository, CommentService,
    SecurityService, SecurityQueryRepository, SecurityRepository,
    ...blogUseCases, ...commentUseCase, ...postUseCase, ...securityUseCase,
    ...userUseCase, ...authUseCase
  ],
})

export class AppModule { }