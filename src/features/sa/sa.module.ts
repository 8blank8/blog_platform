import { Module } from '@nestjs/common';

import { SaBlogController } from './api/sa.blog.controller';
import { UserModule } from '@user/user.module';
import { BlogModule } from '@blog/blog.module';
import { CqrsModule } from '@nestjs/cqrs';
import { SaQueryRepositoryTypeorm } from './infrastructure/sa.query.repository.typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blogs } from '@blog/domain/typeorm/blog.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Blogs]),
    UserModule,
    BlogModule,
    CqrsModule
  ],
  controllers: [SaBlogController],
  providers: [SaQueryRepositoryTypeorm],
})
export class SaModule { }
