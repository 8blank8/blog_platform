import { Module } from '@nestjs/common';
import { SecurityController } from './api/security.controller';
import { SecurityService } from './application/security.service';
import { CreateDeviceUseCase } from './application/useCases/create.device.use.case';
import { DeleteDeviceUseCase } from './application/useCases/delete.device.use.case';
import { DeleteAllDevicesUseCase } from './application/useCases/delete.all.device.use.case';
import { DeleteDeviceForBannedUseCase } from './application/useCases/delete.device.for.banned.use.case';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './domain/mongoose/device.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Devices } from './domain/typeorm/devices.entity';
import { SecurityQueryRepository } from './infrastructure/mongoose/security.query.repository';
import { SecurityRepository } from './infrastructure/mongoose/security.repository';
import { SecurityRepositorySql } from './infrastructure/sql/security.repository.sql';
import { SecurityQueryRepositorySql } from './infrastructure/sql/security.query.repository.sql';
import { SecurityQueryRepositoryTypeorm } from './infrastructure/typeorm/secutity.query.repository.typeorm';
import { SecurityRepositoryTypeorm } from './infrastructure/typeorm/security.repository.typeorm';
import { UserModule } from '../user/user.module';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    TypeOrmModule.forFeature([Devices]),
    UserModule,
  ],
  controllers: [SecurityController],
  providers: [
    SecurityService,
    CreateDeviceUseCase,
    DeleteDeviceUseCase,
    DeleteAllDevicesUseCase,
    DeleteDeviceForBannedUseCase,

    SecurityQueryRepository,
    SecurityRepository,

    SecurityRepositorySql,
    SecurityQueryRepositorySql,

    SecurityQueryRepositoryTypeorm,
    SecurityRepositoryTypeorm,
  ],
  exports: [SecurityQueryRepositoryTypeorm, SecurityRepositoryTypeorm],
})
export class SecurityModule {}
