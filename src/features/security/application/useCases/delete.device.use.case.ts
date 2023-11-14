import { CommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { SecurityRepositoryTypeorm } from '@security/repository/typeorm/security.repository.typeorm';
import { SecurityQueryRepositoryTypeorm } from '@security/repository/typeorm/secutity.query.repository.typeorm';

export class DeleteDeviceCommand {
  constructor(public deviceId: string, public userId: string) {}
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase {
  constructor(
    private securityRepository: SecurityRepositoryTypeorm,
    private securityQueryRepository: SecurityQueryRepositoryTypeorm,
  ) {}

  async execute(command: DeleteDeviceCommand): Promise<boolean> {
    const { deviceId, userId } = command;

    const device = await this.securityQueryRepository.findDeviceById(deviceId);
    if (!device) return false;

    if (device.user.id !== userId) throw new ForbiddenException();

    await this.securityRepository.deleteDeviceById(device.id);

    return true;
  }
}
