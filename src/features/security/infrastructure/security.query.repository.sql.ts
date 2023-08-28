import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";


@Injectable()
export class SecurityQueryRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async findDeviceById(deviceId: string) {
        const device = await this.dataSource.query(`
        SELECT "Id", "UserId", "LastActiveDate", "Ip", "Title"
	        FROM public."Devices"
	    WHERE "Id" = $1;
        `, [deviceId])

        return device.map(this._mapDevice)[0]
    }

    _mapDevice(device) {
        return {
            id: device.Id,
            userId: device.UserId,
            lastActiveDate: device.LastActiveDate,
            ip: device.Ip,
            title: device.Title
        }
    }
}