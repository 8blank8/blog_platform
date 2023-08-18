import { CommandHandler } from "@nestjs/cqrs";
import { DeviceDocument } from "../../domain/device.schema";
import { SecurityRepository } from "../../infrastructure/security.repository";


export class CreateDeviceCommand {
    constructor(
        public userId: string,
        public ip: string,
        public title: string
    ) { }
}

@CommandHandler(CreateDeviceCommand)
export class CreateDeviceUseCase {
    constructor(
        private securityRepository: SecurityRepository,
    ) { }

    async execute(command: CreateDeviceCommand): Promise<DeviceDocument> {

        const { userId, ip, title } = command

        const device = await this.securityRepository.createDevice()

        device.setUserId(userId)
        device.setDeviceId()
        device.setLastActiveDate()
        device.setIp(ip)
        device.setTitle(title)

        await this.securityRepository.saveDevice(device)

        return device
    }
}