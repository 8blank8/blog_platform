import { CommandHandler } from '@nestjs/cqrs';

import { SecurityRepositoryTypeorm } from '../../infrastructure/typeorm/security.repository.typeorm';
import { Devices } from '../../domain/typeorm/devices.entity';
import { UserQueryRepositoryTypeorm } from '../../../../features/user/infrastructure/typeorm/user.query.repository.typeorm';

export class CreateDeviceCommand {
  constructor(public userId: string, public ip: string, public title: string) {}
}

@CommandHandler(CreateDeviceCommand)
export class CreateDeviceUseCase {
  constructor(
    private securityRepository: SecurityRepositoryTypeorm,
    private userQueryRepository: UserQueryRepositoryTypeorm,
  ) {}

  async execute(command: CreateDeviceCommand): Promise<string | boolean> {
    const { userId, ip, title } = command;

    const user = await this.userQueryRepository.findUserByIdForSa(userId);
    if (!user) return false;

    const device = new Devices();
    device.title = title;
    device.ip = ip;
    device.lastActiveDate = new Date().toISOString();
    device.user = user;

    await this.securityRepository.saveDevice(device);

    return device.id;
  }
}
