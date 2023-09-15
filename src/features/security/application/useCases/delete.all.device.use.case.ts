import { CommandHandler } from "@nestjs/cqrs";
import { SecurityRepository } from "../../infrastructure/mongoose/security.repository";
import { SecurityRepositorySql } from "../../infrastructure/sql/security.repository.sql";
import { SecurityRepositoryTypeorm } from "../../infrastructure/typeorm/security.repository.typeorm";


export class DeleteAllDevicesCommand {
    constructor(
        public userId: string,
        public deviceId: string
    ) { }
}

@CommandHandler(DeleteAllDevicesCommand)
export class DeleteAllDevicesUseCase {
    constructor(
        // private securityRepository: SecurityRepository
        private securityRepository: SecurityRepositoryTypeorm
    ) { }

    async execute(command: DeleteAllDevicesCommand) {

        const { userId, deviceId } = command

        return await this.securityRepository.deleteAllDevicesByUserId(userId, deviceId)
    }
}