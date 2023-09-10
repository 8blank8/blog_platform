import { ConfigModule } from '@nestjs/config';
const configModule = ConfigModule.forRoot({})

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema } from './features/blog/domain/mongoose/blog.schema';
import { BlogRepository } from './features/blog/infrastructure/mongo/blog.repository';
import { BlogController } from './features/blog/api/blog.controller';
import { BlogService } from './features/blog/application/blog.service';
import { BlogQueryRepository } from './features/blog/infrastructure/mongo/blog.query.repository';

import { Post, PostSchema } from './features/post/domain/mongoose/post.schema';
import { PostQueryRepository } from './features/post/infrastructure/mongo/post.query.repository';
import { PostControler } from './features/post/api/post.controller';
import { PostService } from './features/post/application/post.service';
import { PostRepository } from './features/post/infrastructure/mongo/post.repository';

import { UserController } from './features/user/api/user.controller';
import { UserService } from './features/user/application/user.service';
import { UserRepository } from './features/user/infrastructure/user.repository';
import { UserQueryRepository } from './features/user/infrastructure/user.query.repository';

import { TestingController } from './features/testing/testing.controller';
import { User, UserSchema } from './features/user/domain/mongoose/user.schema';

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
import { CommentRepository } from './features/comment/infrastructure/mongo/comment.repository';
import { CommentQueryRepository } from './features/comment/infrastructure/mongo/comment.query.repository';
import { Comment, CommentSchema } from './features/comment/domain/mongoose/comment.schema';
import { CommentService } from './features/comment/appication/comment.service';
import { CommentLike, CommentLikeSchema } from './features/comment/domain/mongoose/comment.like.schema';
import { PostLike, PostLikeSchema } from './features/post/domain/mongoose/post.like.schema';
import { CheckBlogId } from './entity/custom-validation/check.blogId';
import { IsNotBlank } from './entity/custom-validation/is.not.blank';
import { LikeStatus } from './entity/custom-validation/like.status';
import { Device, DeviceSchema } from './features/security/domain/mongoose/device.schema';
import { SecurityController } from './features/security/api/security.controller';
import { SecurityQueryRepository } from './features/security/infrastructure/security.query.repository';
import { SecurityService } from './features/security/application/security.service';
import { SecurityRepository } from './features/security/infrastructure/security.repository';
import { JwtRefreshTokenStrategy } from './features/auth/strategies/jwt.refresh.token.straregy';
import { ThrottlerModule } from '@nestjs/throttler';
import { setting_env } from './setting.env';
import { Auth, AuthSchema } from './features/auth/domain/mongoose/auth.schema';
import { AuthRepository } from './features/auth/infrastructure/auth.repository';
import { AuthQueryRepository } from './features/auth/infrastructure/auth.query.repository';

import { CqrsModule } from '@nestjs/cqrs/dist';




import { DeleteCommentUseCase } from './features/comment/appication/useCases/delete.comment.use.case';
import { UpdateCommentUseCase } from './features/comment/appication/useCases/update.comment.use.case';
import { UpdateLikeStatusCommentUseCase } from './features/comment/appication/useCases/update.like.status.comment.use.case'
import { UpdateBanCommentUseCase } from './features/comment/appication/useCases/update.ban.comment.use.case';
import { UpdateBanCommentLikeStatusUseCase } from './features/comment/appication/useCases/update.ban.comment.like.status.use.case';
const commentUseCase = [
  DeleteCommentUseCase, UpdateCommentUseCase, UpdateLikeStatusCommentUseCase,
  UpdateBanCommentUseCase, UpdateBanCommentLikeStatusUseCase
]


import { CreatePostUseCase } from './features/post/application/useCases/create.post.use.case';
import { CreatePostByBlogIdUseCase } from './features/post/application/useCases/create.post.by.blog.id.use.case';
import { UpdatePostUseCase } from './features/post/application/useCases/update.post.use.case';
import { DeletePostUseCase } from './features/post/application/useCases/delete.post.use.case';
import { CreateCommentForPostUseCase } from './features/post/application/useCases/create.comment.for.post';
import { UpdateLikeStatusForPostUseCase } from './features/post/application/useCases/update.like.status.for.post';
import { UpdateBanPostUseCase } from './features/post/application/useCases/update.ban.post.use.case';
import { UpdateBanPostLikeStatusUseCase } from './features/post/application/useCases/update.ban.post.like.status.use.case';
const postUseCase = [
  CreatePostUseCase, CreatePostByBlogIdUseCase, UpdatePostUseCase,
  DeletePostUseCase, CreateCommentForPostUseCase, UpdateLikeStatusForPostUseCase,
  UpdateBanPostUseCase, UpdateBanPostLikeStatusUseCase
]


import { CreateDeviceUseCase } from './features/security/application/useCases/create.device.use.case';
import { DeleteDeviceUseCase } from './features/security/application/useCases/delete.device.use.case';
import { DeleteAllDevicesUseCase } from './features/security/application/useCases/delete.all.device.use.case';
import { DeleteDeviceForBannedUseCase } from './features/security/application/useCases/delete.device.for.banned.use.case';
const securityUseCase = [
  CreateDeviceUseCase, DeleteDeviceUseCase, DeleteAllDevicesUseCase, DeleteDeviceForBannedUseCase
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
import { BloggerController } from './features/blog/api/blogger.controller';
const authUseCase = [
  ValidateUserUseCase, LoginUserUseCase, CreateRefreshTokenUseCase,
  AddRefreshTokenInBlackListUseCase
]

import { CreateBlogUseCase } from './features/blog/application/useCases/create.blog.use.case';
import { UpdateBlogUseCase } from './features/blog/application/useCases/update.blog.use.case';
import { DeleteBlogUseCase } from './features/blog/application/useCases/delete.blog.use.case';
import { DeletePostByBlogIdUseCase } from './features/blog/application/useCases/delete.post.by.blog.id.use.case';
import { UpdatePostByBlogIdUseCase } from './features/blog/application/useCases/update.post.by.blog.id.use.case';
import { SaBlogController } from './features/sa/api/sa.blog.controller';
const bloggerUseCase = [
  DeletePostByBlogIdUseCase, UpdatePostByBlogIdUseCase,
  CreateBlogUseCase, UpdateBlogUseCase, DeleteBlogUseCase
]

import { BindUserForBlogUseCase } from './features/sa/application/useCases/bind.user.for.blog.use.case';
import { SaQueryRepository } from './features/sa/infrastructure/sa.query.repository';
import { BannedUserUseCase } from './features/user/application/useCases/banned.user.use.case';
import { UserBanBlog, UserBanBlogSchema } from './features/blog/domain/mongoose/user.ban.blog.schema';
import { UserBanBlogRepository } from './features/blog/infrastructure/mongo/user.ban.blog.repository';
import { BloggerUserController } from './features/blog/api/blogger.user.controller';
import { BanUserForBlogUseCase } from './features/blog/application/useCases/ban.user.for.blog.use.case';
import { UserBanBlogQueryRepository } from './features/blog/infrastructure/mongo/user.ban.blog.query.repository';
import { BlogBanUseCase } from './features/sa/application/useCases/blog.ban.use.case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserQueryRepositorySql } from './features/user/infrastructure/user.query.repository.sql';
import { UserRepositorySql } from './features/user/infrastructure/user.repository.sql';
import { SecurityQueryRepositorySql } from './features/security/infrastructure/security.query.repository.sql';
import { SecurityRepositorySql } from './features/security/infrastructure/security.repository.sql';
import { AuthRepositorySql } from './features/auth/infrastructure/auth.repository.sql';
import { BlogRepositorySql } from './features/blog/infrastructure/sql/blog.repository.sql';
import { BlogQueryRepositorySql } from './features/blog/infrastructure/sql/blog.query.repository.sql';
import { PostRepositorySql } from './features/post/infrastructure/sql/post.repository.sql';
import { PostQueryRepositorySql } from './features/post/infrastructure/sql/post.query.repository.sql';
import { UserBanBlogQueryRepositorySql } from './features/blog/infrastructure/sql/user.ban.blog.query.repository.sql';
import { UserBanBlogRepositorySql } from './features/blog/infrastructure/sql/user.ban.blog.repository.sql';
import { CommentRepositorySql } from './features/comment/infrastructure/sql/comment.repository.sql';
import { CommentQueryRepositorySql } from './features/comment/infrastructure/sql/comment.query.repository';
import { BlackListRefreshToken } from './features/auth/domain/typeorm/auth.entity';
import { Users } from './features/user/domain/typeorm/user.entity';
import { Blogs } from './features/blog/domain/typeorm/blog.entity';
import { Posts } from './features/post/domain/typeorm/post.entity';
import { PostLikes } from './features/post/domain/typeorm/post.like.entity';
import { PostComments } from './features/comment/domain/typeorm/comment.entitty';
import { PostCommentLike } from './features/comment/domain/typeorm/comment.like.entity';
import { Devices } from './features/security/domain/typeorm/devices.entity';
import { UsersConfirmationEmail } from './features/user/domain/typeorm/user.confirmation.email.entity';
import { UsersPassword } from './features/user/domain/typeorm/user.password.entity';
const saUseCase = [
  BindUserForBlogUseCase, BannedUserUseCase
]


@Module({
  imports: [
    configModule,
    CqrsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'blank',
      password: 'blank',
      database: 'BlogPlatform',
      entities: [],
      autoLoadEntities: true,
      synchronize: true,
    }),
    // TypeOrmModule.forFeature([
    //   BlackListRefreshToken, Users, Blogs, Posts, PostLikes,
    //   PostComments, PostCommentLike, Devices, UsersConfirmationEmail,
    //   UsersPassword
    // ]),
    MongooseModule.forRoot(setting_env.MONGO_URL),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentLike.name, schema: CommentLikeSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: UserBanBlog.name, schema: UserBanBlogSchema }
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
  controllers: [
    AppController, BlogController, PostControler,
    UserController, AuthController, CommentController,
    SecurityController, TestingController, BloggerController,
    SaBlogController, BloggerUserController
  ],
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
    SaQueryRepository, UserBanBlogRepository, BanUserForBlogUseCase,
    UserBanBlogQueryRepository, BlogBanUseCase,

    UserQueryRepositorySql, UserRepositorySql, SecurityQueryRepositorySql, SecurityRepositorySql,
    AuthRepositorySql, BlogRepositorySql, BlogQueryRepositorySql, PostRepositorySql,
    PostQueryRepositorySql, UserBanBlogQueryRepositorySql, UserBanBlogRepositorySql,
    CommentRepositorySql, CommentQueryRepositorySql,
    ...bloggerUseCase, ...commentUseCase, ...postUseCase, ...securityUseCase,
    ...userUseCase, ...authUseCase, ...saUseCase
  ],
})

export class AppModule { }