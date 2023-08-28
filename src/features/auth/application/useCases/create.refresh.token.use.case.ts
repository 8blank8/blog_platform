import { CommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { SecurityQueryRepository } from "src/features/security/infrastructure/security.query.repository";
import { SecurityQueryRepositorySql } from "src/features/security/infrastructure/security.query.repository.sql";
import { SecurityRepository } from "src/features/security/infrastructure/security.repository";
import { SecurityRepositorySql } from "src/features/security/infrastructure/security.repository.sql";
import { setting_env } from "src/setting.env";


export class CreateRefreshTokenCommand {
    constructor(
        public userId: string,
        public deviceId: string
    ) { }
}

@CommandHandler(CreateRefreshTokenCommand)
export class CreateRefreshTokenUseCase {
    constructor(
        // private securityQueryRepository: SecurityQueryRepository,
        // private securityRepository: SecurityRepository,
        private securityQueryRepositorySql: SecurityQueryRepositorySql,
        private securityRepositorySql: SecurityRepositorySql,
        private jwtService: JwtService,
    ) { }

    async execute(command: CreateRefreshTokenCommand): Promise<string | boolean> {

        const { userId, deviceId } = command

        const device = await this.securityQueryRepositorySql.findDeviceById(deviceId)
        if (!device) return false

        await this.securityRepositorySql.updateLastActiveDate(new Date().toISOString(), device.id)
        // device.setLastActiveDate()
        // await this.securityRepository.saveDevice(device)

        const refreshToken = this.jwtService.sign({ userId: userId, deviceId: device.id }, { expiresIn: setting_env.JWT_REFRESH_EXP })
        return refreshToken
    }
}