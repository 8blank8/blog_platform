import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { EmailManager } from '@utils/managers/email.manager';
import { EmailAdapter } from '@utils/adapters/email.adapter';

import { UserRepositoryTypeorm } from './infrastructure/typeorm/user.repository.typeorm';
import { UserQueryRepositoryTypeorm } from './infrastructure/typeorm/user.query.repository.typeorm';
import { Users } from './domain/typeorm/user.entity';
import { UsersConfirmationEmail } from './domain/typeorm/user.confirmation.email.entity';
import { UsersPassword } from './domain/typeorm/user.password.entity';
import { UserController } from './api/user.controller';
import { UserService } from './application/user.service';
import { DeleteUserUseCase } from './application/useCases/delete.user.use.case';
import { ResendingConfirmationCodeUseCase } from './application/useCases/resending.confirmation.code.use.case';
import { EmailConfirmationUseCase } from './application/useCases/email.confirmation.use.case';
import { RegistrationUserUseCase } from './application/useCases/registration.user.use.case';
import { CreateUserUseCase } from './application/useCases/create.user.use.case';
import { User, UserSchema } from './domain/mongoose/user.schema';
import { UserRepository } from './infrastructure/mongo/user.repository';
import { UserQueryRepository } from './infrastructure/mongo/user.query.repository';
import { UserRepositorySql } from './infrastructure/sql/user.repository.sql';
import { UserQueryRepositorySql } from './infrastructure/sql/user.query.repository.sql';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TypeOrmModule.forFeature([Users, UsersConfirmationEmail, UsersPassword]),
  ],
  controllers: [UserController],
  providers: [
    UserRepositoryTypeorm,
    UserQueryRepositoryTypeorm,

    UserRepository,
    UserQueryRepository,

    UserQueryRepositorySql,
    UserRepositorySql,

    UserService,

    CreateUserUseCase,
    RegistrationUserUseCase,
    EmailConfirmationUseCase,
    ResendingConfirmationCodeUseCase,
    DeleteUserUseCase,
    EmailManager,
    EmailAdapter,
  ],
  exports: [
    UserRepositoryTypeorm,
    UserQueryRepositoryTypeorm,
    UserQueryRepositorySql,
    UserQueryRepositorySql,
    UserRepositorySql,
  ],
})
export class UserModule {}
