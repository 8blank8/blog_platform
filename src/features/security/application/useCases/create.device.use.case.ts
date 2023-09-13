import { CommandHandler } from "@nestjs/cqrs";
import { DeviceDocument } from "../../domain/mongoose/device.schema";
import { SecurityRepository } from "../../infrastructure/mongoose/security.repository";
import { SecurityRepositorySql } from "../../infrastructure/sql/security.repository.sql";
import { CreateDeviceForSqlModel } from "../../infrastructure/models/create.device.for.sql.model";
import { SecurityRepositoryTypeorm } from "../../infrastructure/typeorm/security.repository.typeorm";
import { Devices } from "../../domain/typeorm/devices.entity";
import { UserQueryRepositoryTypeorm } from "../../../../features/user/infrastructure/typeorm/user.query.repository.typeorm";


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
        private securityRepository: SecurityRepositoryTypeorm,
        private userQueryRepository: UserQueryRepositoryTypeorm
    ) { }

    async execute(command: CreateDeviceCommand): Promise<string | boolean> {

        const { userId, ip, title } = command

        // const createdDevice: CreateDeviceForSqlModel = {
        //     userId: userId,
        //     lastActiveDate: new Date().toISOString(),
        //     ip: ip,
        //     title: title
        // }

        const user = await this.userQueryRepository.findUserByIdForSa(userId)
        if (!user) return false

        const device = new Devices()
        device.title = title
        device.ip = ip
        device.lastActiveDate = new Date().toISOString()
        device.user = user

        await this.securityRepository.saveDevice(device)
        // const deviceId = await this.securityRepositorySql.createDevice(createdDevice)

        return device.id
        // device.setUserId(userId)
        // device.setDeviceId()
        // device.setLastActiveDate()
        // device.setIp(ip)
        // device.setTitle(title)

        // await this.securityRepository.saveDevice(device)

        // return device
    }
}