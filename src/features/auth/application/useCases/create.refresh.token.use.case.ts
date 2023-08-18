import { CommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { SecurityQueryRepository } from "src/features/security/infrastructure/security.query.repository";
import { SecurityRepository } from "src/features/security/infrastructure/security.repository";


export class CreateRefreshTokenCommand {
    constructor(
        public userId: string,
        public deviceId: string
    ) { }
}

@CommandHandler(CreateRefreshTokenCommand)
export class CreateRefreshTokenUseCase {
    constructor(
        private securityQueryRepository: SecurityQueryRepository,
        private securityRepository: SecurityRepository,
        private jwtService: JwtService,
    ) { }

    async execute(command: CreateRefreshTokenCommand): Promise<string | boolean> {

        const { userId, deviceId } = command

        const device = await this.securityQueryRepository.findDeviceById(deviceId)
        if (!device) return false

        device.setLastActiveDate()
        await this.securityRepository.saveDevice(device)

        const refreshToken = this.jwtService.sign({ userId: userId, deviceId: deviceId }, { expiresIn: '20s' })
        return refreshToken
    }
}