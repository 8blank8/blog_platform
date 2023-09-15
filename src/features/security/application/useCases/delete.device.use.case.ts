import { CommandHandler } from "@nestjs/cqrs";
import { SecurityRepository } from "../../infrastructure/mongoose/security.repository";
import { SecurityQueryRepository } from "../../infrastructure/mongoose/security.query.repository";
import { ForbiddenException } from "@nestjs/common";
import { SecurityQueryRepositorySql } from "../../infrastructure/sql/security.query.repository.sql";
import { SecurityRepositorySql } from "../../infrastructure/sql/security.repository.sql";
import { SecurityRepositoryTypeorm } from "../../infrastructure/typeorm/security.repository.typeorm";
import { SecurityQueryRepositoryTypeorm } from "../../infrastructure/typeorm/secutity.query.repository.typeorm";


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
        private securityRepository: SecurityRepositoryTypeorm,
        private securityQueryRepository: SecurityQueryRepositoryTypeorm
    ) { }

    async execute(command: DeleteDeviceCommand): Promise<boolean> {

        const { deviceId, userId } = command

        const device = await this.securityQueryRepository.findDeviceById(deviceId)
        if (!device) return false

        if (device.user.id !== userId) throw new ForbiddenException()

        await this.securityRepository.deleteDeviceById(device.id)

        return true
    }
}