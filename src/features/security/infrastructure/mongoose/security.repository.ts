import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Device,
  DeviceDocument,
} from '@security/domain/mongoose/device.schema';
import { Model } from 'mongoose';

@Injectable()
export class SecurityRepository {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async createDevice(): Promise<DeviceDocument> {
    return new this.deviceModel();
  }

  async saveDevice(device: DeviceDocument): Promise<DeviceDocument> {
    return await device.save();
  }

  async deleteDevice(deviceId: string): Promise<boolean> {
    const res = await this.deviceModel.deleteOne({ deviceId: deviceId });
    return res.deletedCount === 1;
  }

  async deleteAllDevices(userId: string, deviceId: string) {
    return await this.deviceModel.deleteMany({
      userId: userId,
      $nor: [{ deviceId: deviceId }],
    });
  }

  async deleteDeviceForBanned(userId: string) {
    return await this.deviceModel.deleteMany({ userId: userId });
  }
}
