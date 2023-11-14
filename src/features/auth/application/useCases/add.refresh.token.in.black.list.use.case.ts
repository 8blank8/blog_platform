import { CommandHandler } from '@nestjs/cqrs';
import { SecurityRepositoryTypeorm } from '@security/repository/typeorm/security.repository.typeorm';
import { BlackListRefreshToken } from '@auth/domain/typeorm/auth.entity';
import { AuthRepositoryTypeorm } from '@auth/repository/typeorm/auth.repository.typeorm';

export class AddRefreshTokenInBlackListCommand {
  constructor(public refreshToken: string, public deviceId?: string) {}
}

@CommandHandler(AddRefreshTokenInBlackListCommand)
export class AddRefreshTokenInBlackListUseCase {
  constructor(
    private authRepository: AuthRepositoryTypeorm,
    private securityRepository: SecurityRepositoryTypeorm,
  ) {}

  async execute(command: AddRefreshTokenInBlackListCommand) {
    const { refreshToken, deviceId } = command;

    const createdRefreshToken = new BlackListRefreshToken();
    createdRefreshToken.refreshToken = refreshToken;

    await this.authRepository.saveToken(createdRefreshToken);

    if (deviceId) {
      const isDeleteDevice = await this.securityRepository.deleteDeviceById(
        deviceId,
      );
      return isDeleteDevice;
    }

    return true;
  }
}
