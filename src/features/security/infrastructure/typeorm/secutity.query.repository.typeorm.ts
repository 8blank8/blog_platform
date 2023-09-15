import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Devices } from "../../domain/typeorm/devices.entity";
import { Repository } from "typeorm";
import { DeviceViewSqlModel } from "../models/queryRepositorySql/device.view.sql.model";


@Injectable()
export class SecurityQueryRepositoryTypeorm {
    constructor(@InjectRepository(Devices) private securityRepository: Repository<Devices>) { }

    async findDeviceById(deviceId: string): Promise<Devices | null> {
        const queryBuilder = this.securityRepository.createQueryBuilder('d')

        const device = await queryBuilder
            .where('d.id = :deviceId', { deviceId })
            .leftJoinAndSelect('d.user', 'u')
            .getOne()

        return device
    }


    async findDevicesUserByUserId(userId: string): Promise<DeviceViewSqlModel[]> {
        const qb = this.securityRepository.createQueryBuilder('d')

        const devices = await qb
            .where('d.userId = :userId', { userId })
            .getMany()

        return devices.map(this._mapDeviceView)
    }

    private _mapDeviceView(device: Devices): DeviceViewSqlModel {
        return {
            deviceId: device.id,
            ip: device.ip,
            lastActiveDate: device.lastActiveDate,
            title: device.title
        }
    }
}