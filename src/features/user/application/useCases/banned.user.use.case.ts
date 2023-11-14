import { CommandHandler } from '@nestjs/cqrs';
import { UserBanModel } from '../../models/user.ban.model';
import { UserQueryRepositorySql } from '../../infrastructure/sql/user.query.repository.sql';
import { UserRepositorySql } from '../../infrastructure/sql/user.repository.sql';
import { UpdateBannedUserForSqlModel } from '../../infrastructure/models/repositorySql/update.banned.user.for.sql.model';

export class BannedUserCommand {
  constructor(public inputData: UserBanModel, public userId: string) {}
}

@CommandHandler(BannedUserCommand)
export class BannedUserUseCase {
  constructor(
    private userQueryRepositorySql: UserQueryRepositorySql,
    private userRepositorySql: UserRepositorySql,
  ) {}

  async execute(command: BannedUserCommand): Promise<boolean> {
    const { isBanned, banReason } = command.inputData;
    const { userId } = command;

    const user = await this.userQueryRepositorySql.findUser(userId);
    if (!user) return false;

    const banDto: UpdateBannedUserForSqlModel = {
      userId: userId,
      isBanned: isBanned,
      banReason: banReason,
    };

    const userIsBanned =
      await this.userQueryRepositorySql.findBannedUserByIdForSa(userId);

    if (!userIsBanned) {
      await this.userRepositorySql.createBanUserByIdForSa(banDto);
      return true;
    }

    if (isBanned) {
      await this.userRepositorySql.updateBanUserByIdForSa(banDto);
      return true;
    }

    await this.userRepositorySql.updateUnbanUserByIdForSa(userId);
    return true;
  }
}
