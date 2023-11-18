import { ConfigModule } from '@nestjs/config';
// eslint-disable-next-line no-unused-vars
const configModule = ConfigModule.forRoot({});
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestingModule } from '@nestjs/testing';

import { setting_env } from './utils/enums/setting.env';
import { AppController } from './app.controller';
import { EmailAdapter } from './utils/adapters/email.adapter';
import { EmailManager } from './utils/managers/email.manager';
import { UserIsConfirmed } from './utils/custom-validation/confirmation.code.type';
import { UserExistLogin } from './utils/custom-validation/user.exist.login';
import { UserExistEmail } from './utils/custom-validation/user.exist.email';
import { EmailCodeResend } from './utils/custom-validation/email.code.resend';
import { CheckBlogId } from './utils/custom-validation/check.blogId';
import { IsNotBlank } from './utils/custom-validation/is.not.blank';
import { LikeStatus } from './utils/custom-validation/like.status';
import { BlogBanUseCase } from './features/sa/application/useCases/blog.ban.use.case';
import { BindUserForBlogUseCase } from './features/sa/application/useCases/bind.user.for.blog.use.case';
import { BannedUserUseCase } from './features/user/application/useCases/banned.user.use.case';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { BlogModule } from './features/blog/blog.module';
import { CommentModule } from './features/comment/comment.module';
import { PostModule } from './features/post/post.module';
import { QuizModule } from './features/quiz/quiz.module';
import { SecurityModule } from './features/security/security.module';
import { AppService } from './app.service';
import { TestingController } from '@testing/testing.controller';

const controllers = [AppController, TestingController];

const services = [AppService];

const adapters = [EmailAdapter, EmailManager];

const validation = [
  UserIsConfirmed,
  UserExistEmail,
  UserExistLogin,
  EmailCodeResend,
  CheckBlogId,
  IsNotBlank,
  LikeStatus,
];
const saUseCase = [BindUserForBlogUseCase, BannedUserUseCase, BlogBanUseCase];

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
      database: 'Blog_Platform',
      entities: [],
      autoLoadEntities: true,
      synchronize: true,
    }),
    MongooseModule.forRoot(setting_env.MONGO_URL),
    ThrottlerModule.forRoot({
      ttl: +setting_env.TTL,
      limit: +setting_env.LIMIT,
    }),
    PassportModule,
    JwtModule.register({}),

    AuthModule,
    UserModule,
    BlogModule,
    CommentModule,
    PostModule,
    QuizModule,
    SecurityModule,
    // TestingModule,
    // SaModule
  ],
  controllers: [...controllers],
  providers: [...validation, ...adapters, ...saUseCase, ...services],
})
export class AppModule { }
