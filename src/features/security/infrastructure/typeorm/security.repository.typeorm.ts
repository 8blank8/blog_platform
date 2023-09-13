import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Devices } from "../../domain/typeorm/devices.entity";
import { Repository } from "typeorm";


@Injectable()
export class SecurityRepositoryTypeorm {
    constructor(@InjectRepository(Devices) private securityRepository: Repository<Devices>) { }

    async saveDevice(device: Devices) {
        return this.securityRepository.save(device)
    }
}