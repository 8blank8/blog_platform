import { CommandHandler } from "@nestjs/cqrs";
import { SecurityRepository } from "../../infrastructure/mongoose/security.repository";
import { SecurityRepositorySql } from "../../infrastructure/sql/security.repository.sql";


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
        private securityRepositorySql: SecurityRepositorySql
    ) { }

    async execute(command: DeleteAllDevicesCommand) {

        const { userId, deviceId } = command

        return await this.securityRepositorySql.deleteAllDevicesByUserId(userId, deviceId)
    }
}