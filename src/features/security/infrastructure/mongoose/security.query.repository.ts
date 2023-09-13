import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Device, DeviceDocument } from "../../domain/mongoose/device.schema";
import { Model } from "mongoose";
import { DeviceViewType } from "../../models/device.view.type";


@Injectable()
export class SecurityQueryRepository {
    constructor(@InjectModel(Device.name) private deviceModel: Model<DeviceDocument>) { }

    async findDevice(userId: string): Promise<DeviceViewType[] | null> {
        const devices = await this.deviceModel.find({ userId: userId })
        if (!devices) return null

        return devices.map(this._mapDevice)
    }

    async findDeviceById(deviceId: string): Promise<DeviceDocument | null> {
        const device = await this.deviceModel.findOne({ deviceId: deviceId })
        return device
    }

    _mapDevice(device: DeviceDocument): DeviceViewType {
        return {
            ip: device.ip,
            title: device.title,
            lastActiveDate: device.lastActiveDate,
            deviceId: device.deviceId
        }
    }
}