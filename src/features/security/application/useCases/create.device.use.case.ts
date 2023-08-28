import { CommandHandler } from "@nestjs/cqrs";
import { DeviceDocument } from "../../domain/device.schema";
import { SecurityRepository } from "../../infrastructure/security.repository";
import { SecurityRepositorySql } from "../../infrastructure/security.repository.sql";
import { CreateDeviceForSqlModel } from "../../infrastructure/models/create.device.for.sql.model";


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
        // private securityRepository: SecurityRepository,
        private securityRepositorySql: SecurityRepositorySql
    ) { }

    async execute(command: CreateDeviceCommand): Promise<DeviceDocument> {

        const { userId, ip, title } = command

        const createdDevice: CreateDeviceForSqlModel = {
            userId: userId,
            lastActiveDate: new Date().toISOString(),
            ip: ip,
            title: title
        }

        const deviceId = await this.securityRepositorySql.createDevice(createdDevice)
        return deviceId
        // device.setUserId(userId)
        // device.setDeviceId()
        // device.setLastActiveDate()
        // device.setIp(ip)
        // device.setTitle(title)

        // await this.securityRepository.saveDevice(device)

        // return device
    }
}