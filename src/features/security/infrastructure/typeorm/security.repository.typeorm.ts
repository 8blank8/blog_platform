import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Devices } from '@security/domain/typeorm/devices.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SecurityRepositoryTypeorm {
  constructor(
    @InjectRepository(Devices) private securityRepository: Repository<Devices>,
  ) {}

  async saveDevice(device: Devices) {
    return this.securityRepository.save(device);
  }

  async deleteDeviceById(deviceId: string) {
    return this.securityRepository.delete({ id: deviceId });
  }

  async deleteAllDevicesByUserId(userId: string, deviceId: string) {
    return this.securityRepository
      .createQueryBuilder('d')
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('id != :deviceId', { deviceId })
      .execute();
  }
}
