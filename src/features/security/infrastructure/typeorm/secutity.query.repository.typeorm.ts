import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Devices } from "../../domain/typeorm/devices.entity";
import { Repository } from "typeorm";


@Injectable()
export class SecurityQueryRepositoryTypeorm {
    constructor(@InjectRepository(Devices) private securityRepository: Repository<Devices>) { }

    async findDeviceById(deviceId: string): Promise<Devices | null> {
        const queryBuilder = this.securityRepository.createQueryBuilder('d')

        const device = queryBuilder
            .where('id = :deviceId', { deviceId })
            .getOne()

        return device
    }
}