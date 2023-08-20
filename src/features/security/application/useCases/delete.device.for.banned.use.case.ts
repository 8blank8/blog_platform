import { CommandHandler } from "@nestjs/cqrs";
import { SecurityRepository } from "../../infrastructure/security.repository";


export class DeleteDeviceForBannedCommand {
    constructor(
        public userId: string
    ) { }
}

@CommandHandler(DeleteDeviceForBannedCommand)
export class DeleteDeviceForBannedUseCase {

    constructor(
        private securityRepository: SecurityRepository
    ) { }

    async execute(command: DeleteDeviceForBannedCommand) {
        const { userId } = command

        return await this.securityRepository.deleteDeviceForBanned(userId)
    }
}