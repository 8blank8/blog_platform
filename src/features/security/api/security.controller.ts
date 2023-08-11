import { Controller, Delete, Get, Param, Request, Res, UseGuards } from "@nestjs/common";
import { SecurityQueryRepository } from "../infrastructure/security.query.repository";
import { JwtRefreshTokenGuard } from "src/features/auth/guards/jwt.refresh.token.guard";
import { SecurityService } from "../application/security.service";
import { Response } from 'express'



@Controller('/security')
export class SecurityController {

    constructor(
        private readonly securityQueryRepository: SecurityQueryRepository,
        private readonly securityService: SecurityService
    ) { }

    @UseGuards(JwtRefreshTokenGuard)
    @Get('/devices')
    async findDevices(
        @Request() req
    ) {
        const devices = this.securityQueryRepository.findDevice(req.user.userId)
        return devices
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Delete('/devices/:id')
    async deleteDeviceById(
        @Param('id') id: string,
        @Request() req,
        @Res() res: Response
    ) {
        const isDelete = await this.securityService.deleteDeviceById(id, req.user.userId)
        if (!isDelete) return res.sendStatus(404)

        return res.sendStatus(204)
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Delete('/devices')
    async deleteAllDevices(
        @Request() req
    ) {
        return await this.securityService.deleteAllDevices(req.user.userId, req.user.deviceId)
    }
}