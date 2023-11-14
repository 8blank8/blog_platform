import { Module } from '@nestjs/common';
import { SaQueryRepository } from './infrastructure/sa.query.repository';
import { SaBlogController } from './api/sa.blog.controller';

@Module({
  controllers: [SaBlogController],
  providers: [SaQueryRepository],
})
export class SaModule {}
