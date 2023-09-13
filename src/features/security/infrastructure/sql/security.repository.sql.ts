import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateDeviceForSqlModel } from "../models/create.device.for.sql.model";


@Injectable()
export class SecurityRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createDevice(device: CreateDeviceForSqlModel) {

        const { userId, title, lastActiveDate, ip } = device

        const deviceId = await this.dataSource.query(`
            INSERT INTO public."Devices"(
                "UserId", "LastActiveDate", "Ip", "Title")
            VALUES ($1, $2, $3, $4) RETURNING "Id";
        `, [userId, lastActiveDate, ip, title])

        return deviceId[0].Id
    }

    async updateLastActiveDate(lastActiveDate: string, deviceId: string) {
        const device = await this.dataSource.query(`
            UPDATE public."Devices"
	        SET "LastActiveDate"= $2
	        WHERE "Id" = $1 
            RETURNING "Id";
        `, [deviceId, lastActiveDate])

        return device[0].Id
    }

    async deleteDeviceById(deviceId: string) {
        await this.dataSource.query(`
            DELETE FROM public."Devices"
	        WHERE "Id" = $1;
        `, [deviceId])

        return true
    }

    async deleteAllDevicesByUserId(userId: string, deviceId: string) {
        await this.dataSource.query(`
            DELETE FROM public."Devices"
	        WHERE "UserId" = $1 
	        AND "Id" != $2;
        `, [userId, deviceId])
    }
}