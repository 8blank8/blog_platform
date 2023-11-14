import { CommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { setting_env } from '@app/setting.env';
import { SecurityQueryRepositoryTypeorm } from '@app/features/security/infrastructure/typeorm/secutity.query.repository.typeorm';
import { SecurityRepositoryTypeorm } from '@app/features/security/infrastructure/typeorm/security.repository.typeorm';

export class CreateRefreshTokenCommand {
  constructor(public userId: string, public deviceId: string) {}
}

@CommandHandler(CreateRefreshTokenCommand)
export class CreateRefreshTokenUseCase {
  constructor(
    private securityQueryRepository: SecurityQueryRepositoryTypeorm,
    private securityRepository: SecurityRepositoryTypeorm,
    private jwtService: JwtService,
  ) {}

  async execute(command: CreateRefreshTokenCommand): Promise<string | boolean> {
    const { userId, deviceId } = command;

    const device = await this.securityQueryRepository.findDeviceById(deviceId);
    if (!device) return false;

    device.lastActiveDate = new Date().toISOString();

    await this.securityRepository.saveDevice(device);

    const refreshToken = this.jwtService.sign(
      { userId: userId, deviceId: device.id },
      {
        expiresIn: setting_env.JWT_REFRESH_EXP,
        secret: setting_env.JWT_SECRET,
      },
    );
    return refreshToken;
  }
}
