import { Controller, Delete, Get, Param, Request, Res, UseGuards } from "@nestjs/common";
import { SecurityQueryRepository } from "../infrastructure/security.query.repository";
import { JwtRefreshTokenGuard } from "../../auth/guards/jwt.refresh.token.guard";
import { SecurityService } from "../application/security.service";
import { Response } from 'express'
import { STATUS_CODE } from "../../../entity/enum/status.code";
import { CommandBus } from "@nestjs/cqrs";
import { DeleteDeviceCommand } from "../application/useCases/delete.device.use.case";
import { DeleteAllDevicesCommand } from "../application/useCases/delete.all.device.use.case";
import { SecurityQueryRepositorySql } from "../infrastructure/security.query.repository.sql";



@Controller('/security')
export class SecurityController {

    constructor(
        // private readonly securityQueryRepository: SecurityQueryRepository,
        private securityQueryRepositorySql: SecurityQueryRepositorySql,
        private securityService: SecurityService,
        private commandBus: CommandBus
    ) { }

    @UseGuards(JwtRefreshTokenGuard)
    @Get('/devices')
    async findDevices(
        @Request() req
    ) {
        const devices = this.securityQueryRepositorySql.findDevicesUserByUserId(req.user.userId)
        return devices
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Delete('/devices/:id')
    async deleteDeviceById(
        @Param('id') id: string,
        @Request() req,
        @Res() res: Response
    ) {
        const isDelete = await this.commandBus.execute(new DeleteDeviceCommand(id, req.user.userId))
        if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Delete('/devices')
    async deleteAllDevices(
        @Request() req,
        @Res() res: Response
    ) {
        await this.commandBus.execute(new DeleteAllDevicesCommand(req.user.userId, req.user.deviceId))
        res.sendStatus(204)
    }
}