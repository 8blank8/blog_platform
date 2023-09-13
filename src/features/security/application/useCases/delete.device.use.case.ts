import { CommandHandler } from "@nestjs/cqrs";
import { SecurityRepository } from "../../infrastructure/mongoose/security.repository";
import { SecurityQueryRepository } from "../../infrastructure/mongoose/security.query.repository";
import { ForbiddenException } from "@nestjs/common";
import { SecurityQueryRepositorySql } from "../../infrastructure/sql/security.query.repository.sql";
import { SecurityRepositorySql } from "../../infrastructure/sql/security.repository.sql";


export class DeleteDeviceCommand {
    constructor(
        public deviceId: string,
        public userId: string
    ) { }
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase {
    constructor(
        // private securityRepository: SecurityRepository,
        // private securityQueryRepository: SecurityQueryRepository
        private securityRepositorySql: SecurityRepositorySql,
        private securityQueryRepositorySql: SecurityQueryRepositorySql
    ) { }

    async execute(command: DeleteDeviceCommand): Promise<boolean> {

        const { deviceId, userId } = command

        const device = await this.securityQueryRepositorySql.findDeviceById(deviceId)
        if (!device) return false

        if (device.userId !== userId) throw new ForbiddenException()

        return await this.securityRepositorySql.deleteDeviceById(device.id)
    }
}