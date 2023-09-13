import { CommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
// import { SecurityQueryRepository } from "src/features/security/infrastructure/security.query.repository";
import { SecurityQueryRepositorySql } from "../../../security/infrastructure/sql/security.query.repository.sql";
// import { SecurityRepository } from "src/features/security/infrastructure/security.repository";
import { SecurityRepositorySql } from "../../../security/infrastructure/sql/security.repository.sql";
import { setting_env } from "../../../../setting.env";
import { SecurityQueryRepositoryTypeorm } from "../../../../features/security/infrastructure/typeorm/secutity.query.repository.typeorm";
import { SecurityRepositoryTypeorm } from "../../../../features/security/infrastructure/typeorm/security.repository.typeorm";


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
        private securityQueryRepository: SecurityQueryRepositoryTypeorm,
        private securityRepository: SecurityRepositoryTypeorm,
        private jwtService: JwtService,
    ) { }

    async execute(command: CreateRefreshTokenCommand): Promise<string | boolean> {

        const { userId, deviceId } = command

        const device = await this.securityQueryRepository.findDeviceById(deviceId)
        if (!device) return false

        device.lastActiveDate = new Date().toISOString()

        await this.securityRepository.saveDevice(device)
        // await this.securityRepository.updateLastActiveDate(new Date().toISOString(), device.id)
        // device.setLastActiveDate()
        // await this.securityRepository.saveDevice(device)

        const refreshToken = this.jwtService.sign({ userId: userId, deviceId: device.id }, { expiresIn: setting_env.JWT_REFRESH_EXP })
        return refreshToken
    }
}