import { Module } from '@nestjs/common';
import { AuthController } from './api/auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from '../user/user.module';
import { AddRefreshTokenInBlackListUseCase } from './application/useCases/add.refresh.token.in.black.list.use.case';
import { CreateRefreshTokenUseCase } from './application/useCases/create.refresh.token.use.case';
import { LoginUserUseCase } from './application/useCases/login.user.use.case';
import { ValidateUserUseCase } from './application/useCases/validate.user.use.case';
import { AuthService } from './application/auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Auth, AuthSchema } from './domain/mongoose/auth.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlackListRefreshToken } from './domain/typeorm/auth.entity';
import { AuthRepository } from './infrastructure/mongoose/auth.repository';
import { AuthQueryRepository } from './infrastructure/mongoose/auth.query.repository';
import { AuthRepositorySql } from './infrastructure/sql/auth.repository.sql';
import { AuthRepositoryTypeorm } from './infrastructure/typeorm/auth.repository.typeorm';
import { BasicStrategy } from './strategies/basic-strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt.refresh.token.straregy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SecurityModule } from '../security/security.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    CqrsModule,
    UserModule,
    MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
    TypeOrmModule.forFeature([BlackListRefreshToken]),
    SecurityModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthRepository,
    AuthQueryRepository,
    AuthRepositorySql,
    AuthRepositoryTypeorm,
    AddRefreshTokenInBlackListUseCase,
    CreateRefreshTokenUseCase,
    LoginUserUseCase,
    ValidateUserUseCase,
    AuthService,
    BasicStrategy,
    JwtRefreshTokenStrategy,
    JwtStrategy,
    LocalStrategy,
    JwtService,
  ],
  exports: [
    AuthRepository,
    AuthQueryRepository,
    AuthRepositorySql,
    AuthRepositoryTypeorm,
  ],
})
export class AuthModule {}
