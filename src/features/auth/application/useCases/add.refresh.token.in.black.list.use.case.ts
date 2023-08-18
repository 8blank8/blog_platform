import { CommandHandler } from "@nestjs/cqrs";
import { AuthRepository } from "../../infrastructure/auth.repository";
import { SecurityRepository } from "src/features/security/infrastructure/security.repository";


export class AddRefreshTokenInBlackListCommand {
    constructor(
        public refreshToken: string,
        public deviceId?: string
    ) { }
}

@CommandHandler(AddRefreshTokenInBlackListCommand)
export class AddRefreshTokenInBlackListUseCase {
    constructor(
        private authRepository: AuthRepository,
        private securityRepository: SecurityRepository
    ) { }

    async execute(command: AddRefreshTokenInBlackListCommand) {

        const { refreshToken, deviceId } = command

        const token = await this.authRepository.postRefreshToken({ refreshToken })

        if (deviceId) {
            const isDeleteDevice = await this.securityRepository.deleteDevice(deviceId)
            return isDeleteDevice
        }

        await this.authRepository.save(token)
        return
    }
}