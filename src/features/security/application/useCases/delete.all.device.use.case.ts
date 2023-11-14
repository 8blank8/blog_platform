import { CommandHandler } from '@nestjs/cqrs';
import { SecurityRepositoryTypeorm } from '@security/repository/typeorm/security.repository.typeorm';

export class DeleteAllDevicesCommand {
  constructor(public userId: string, public deviceId: string) {}
}

@CommandHandler(DeleteAllDevicesCommand)
export class DeleteAllDevicesUseCase {
  constructor(private securityRepository: SecurityRepositoryTypeorm) {}

  async execute(command: DeleteAllDevicesCommand) {
    const { userId, deviceId } = command;

    return await this.securityRepository.deleteAllDevicesByUserId(
      userId,
      deviceId,
    );
  }
}
