import { CommandBus, CommandHandler } from "@nestjs/cqrs";
import { UserBanModel } from "../../models/user.ban.model";
import { UserQueryRepository } from "../../infrastructure/mongo/user.query.repository";
import { UserRepository } from "../../infrastructure/mongo/user.repository";
import { DeleteDeviceForBannedCommand } from "src/features/security/application/useCases/delete.device.for.banned.use.case";
import { UpdateBanPostCommand } from "src/features/post/application/useCases/update.ban.post.use.case";
import { UpdateBanCommentCommand } from "src/features/comment/appication/useCases/update.ban.comment.use.case";
import { UpdateBanCommentLikeStatusCommand } from "src/features/comment/appication/useCases/update.ban.comment.like.status.use.case";
import { UpdateBanPostLikeStatusCommand } from "src/features/post/application/useCases/update.ban.post.like.status.use.case";
import { UserQueryRepositorySql } from "../../infrastructure/sql/user.query.repository.sql";
import { UserRepositorySql } from "../../infrastructure/sql/user.repository.sql";
import { UpdateBannedUserForSqlModel } from "../../infrastructure/models/repositorySql/update.banned.user.for.sql.model";


export class BannedUserCommand {
    constructor(
        public inputData: UserBanModel,
        public userId: string
    ) { }
}

@CommandHandler(BannedUserCommand)
export class BannedUserUseCase {
    constructor(
        // private userQueryRepository: UserQueryRepository,
        // private userRepository: UserRepository,
        private userQueryRepositorySql: UserQueryRepositorySql,
        private userRepositorySql: UserRepositorySql,
        // private commandBus: CommandBus
    ) { }

    async execute(command: BannedUserCommand): Promise<boolean> {

        const { isBanned, banReason } = command.inputData
        const { userId } = command

        const user = await this.userQueryRepositorySql.findUser(userId)
        if (!user) return false

        const banDto: UpdateBannedUserForSqlModel = {
            userId: userId,
            isBanned: isBanned,
            banReason: banReason,
        }

        const userIsBanned = await this.userQueryRepositorySql.findBannedUserByIdForSa(userId)

        if (!userIsBanned) {
            await this.userRepositorySql.createBanUserByIdForSa(banDto)
            return true
        }

        if (isBanned) {
            await this.userRepositorySql.updateBanUserByIdForSa(banDto)
            return true
        }

        await this.userRepositorySql.updateUnbanUserByIdForSa(userId)
        // user.bannedUser(isBanned, banReason)
        // await this.commandBus.execute(new UpdateBanPostCommand(isBanned, user.id))
        // await this.commandBus.execute(new UpdateBanCommentCommand(isBanned, user.id))
        // await this.commandBus.execute(new UpdateBanCommentLikeStatusCommand(isBanned, user.id))
        // await this.commandBus.execute(new UpdateBanPostLikeStatusCommand(isBanned, user.id))

        // if (isBanned) {
        //     await this.commandBus.execute(new DeleteDeviceForBannedCommand(user.id))
        // }

        // await this.userRepository.save(user)
        return true
    }
}