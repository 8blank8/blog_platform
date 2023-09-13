import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { DeviceViewSqlModel } from "../models/queryRepositorySql/device.view.sql.model";


@Injectable()
export class SecurityQueryRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async findDevicesUserByUserId(userId: string): Promise<DeviceViewSqlModel[]> {
        const devices = await this.dataSource.query(`
            SELECT "Id", "UserId", "LastActiveDate", "Ip", "Title"
	            FROM public."Devices"
	        WHERE "UserId" = $1;
        `, [userId])

        return devices.map(this._mapDeviceView)
    }

    async findDeviceById(deviceId: string) {
        const device = await this.dataSource.query(`
            SELECT "Id", "UserId", "LastActiveDate", "Ip", "Title"
	            FROM public."Devices"
	        WHERE "Id" = $1;
        `, [deviceId])

        return device.map(this._mapDevice)[0]
    }

    async findDeviceViewById(deviceId: string): Promise<DeviceViewSqlModel> {
        const device = await this.dataSource.query(`
            SELECT "Id", "UserId", "LastActiveDate", "Ip", "Title"
	            FROM public."Devices"
	        WHERE "Id" = $1;
        `, [deviceId])

        return device.map(this._mapDeviceView)[0]
    }

    _mapDevice(device) {
        return {
            id: device.Id,
            ip: device.Ip,
            lastActiveDate: device.LastActiveDate,
            title: device.Title,
            userId: device.UserId
        }
    }

    _mapDeviceView(device): DeviceViewSqlModel {
        return {
            deviceId: device.Id,
            ip: device.Ip,
            lastActiveDate: device.LastActiveDate,
            title: device.Title
        }
    }
}