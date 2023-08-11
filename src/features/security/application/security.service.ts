import { ForbiddenException, Injectable } from "@nestjs/common";
import { SecurityRepository } from "../infrastructure/security.repository";
import { DeviceDocument } from "../domain/device.schema";
import { SecurityQueryRepository } from "../infrastructure/security.query.repository";


@Injectable()
export class SecurityService {

    constructor(
        private readonly securityRepository: SecurityRepository,
        private readonly securityQueryRepository: SecurityQueryRepository
    ) { }

    async createDevice(userId: string, ip: string, title: string): Promise<DeviceDocument> {
        const device = await this.securityRepository.createDevice()

        device.setUserId(userId)
        device.setDeviceId()
        device.setLastActiveDate()
        device.setIp(ip)
        device.setTitle(title)

        await this.securityRepository.saveDevice(device)

        return device
    }

    async deleteDeviceById(deviceId: string, userId: string): Promise<boolean> {
        const device = await this.securityQueryRepository.findDeviceById(deviceId)
        if (!device) return false

        if (device.userId !== userId) throw new ForbiddenException()

        return await this.securityRepository.deleteDevice(device.deviceId)
    }

    async deleteAllDevices(userId: string, deviceId: string) {
        return await this.securityRepository.deleteAllDevices(userId, deviceId)
    }
}