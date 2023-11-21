import { CommandHandler } from '@nestjs/cqrs';
import { SecurityRepositoryTypeorm } from '@security/repository/typeorm/security.repository.typeorm';
import { UserBanned } from '@user/domain/typeorm/user.banned.entity';
import { UserBanModel } from '@user/models/user.ban.model';
import { UserQueryRepositoryTypeorm } from '@user/repository/typeorm/user.query.repository.typeorm';
import { UserRepositoryTypeorm } from '@user/repository/typeorm/user.repository.typeorm';

export class BannedUserCommand {
  constructor(public inputData: UserBanModel, public userId: string) { }
}

@CommandHandler(BannedUserCommand)
export class BannedUserUseCase {
  constructor(
    private userQueryRepository: UserQueryRepositoryTypeorm,
    private userRepository: UserRepositoryTypeorm,
    private securityRepository: SecurityRepositoryTypeorm
  ) { }

  async execute(command: BannedUserCommand): Promise<boolean> {
    let { isBanned, banReason } = command.inputData;
    const { userId } = command;
    console.log({ isBanned, banReason })
    const user = await this.userQueryRepository.findUserByIdForSa(userId);
    if (!user) return false;

    let banInfo = await this.userQueryRepository.findBanInfoByUserId(userId)
    if (!banInfo) return false

    banInfo.banReason = isBanned ? banReason : null
    banInfo.isBanned = isBanned
    banInfo.banDate = isBanned ? new Date().toISOString() : null

    await this.userRepository.saveUserBanned(banInfo)

    await this.securityRepository.deleteAllDevicesForSa(user.id)

    return true
  }
}
