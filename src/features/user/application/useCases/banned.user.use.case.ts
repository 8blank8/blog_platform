import { CommandBus, CommandHandler } from "@nestjs/cqrs";
import { UserBanModel } from "../../models/user.ban.model";
import { UserQueryRepository } from "../../infrastructure/user.query.repository";
import { UserRepository } from "../../infrastructure/user.repository";
import { DeleteDeviceForBannedCommand } from "src/features/security/application/useCases/delete.device.for.banned.use.case";


export class BannedUserCommand {
    constructor(
        public inputData: UserBanModel,
        public userId: string
    ) { }
}

@CommandHandler(BannedUserCommand)
export class BannedUserUseCase {
    constructor(
        private userQueryRepository: UserQueryRepository,
        private userRepository: UserRepository,
        private commandBus: CommandBus
    ) { }

    async execute(command: BannedUserCommand): Promise<boolean> {

        const { isBanned, banReason } = command.inputData
        const { userId } = command

        const user = await this.userQueryRepository.findUserDocumentById(userId)
        if (!user) return false

        if (isBanned) {
            user.bannedUser(banReason)
            await this.commandBus.execute(new DeleteDeviceForBannedCommand(user.id))
        }

        await this.userRepository.save(user)
        return true
    }
}