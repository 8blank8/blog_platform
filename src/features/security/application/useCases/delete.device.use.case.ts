import { CommandHandler } from "@nestjs/cqrs";
import { SecurityRepository } from "../../infrastructure/security.repository";
import { SecurityQueryRepository } from "../../infrastructure/security.query.repository";
import { ForbiddenException } from "@nestjs/common";


export class DeleteDeviceCommand {
    constructor(
        public deviceId: string,
        public userId: string
    ) { }
}

@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase {
    constructor(
        private securityRepository: SecurityRepository,
        private securityQueryRepository: SecurityQueryRepository
    ) { }

    async execute(command: DeleteDeviceCommand): Promise<boolean> {

        const { deviceId, userId } = command

        const device = await this.securityQueryRepository.findDeviceById(deviceId)
        if (!device) return false

        if (device.userId !== userId) throw new ForbiddenException()

        return await this.securityRepository.deleteDevice(device.deviceId)
    }
}