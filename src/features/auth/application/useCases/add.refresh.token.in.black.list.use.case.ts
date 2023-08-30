import { CommandHandler } from "@nestjs/cqrs";
import { AuthRepository } from "../../infrastructure/auth.repository";
import { SecurityRepository } from "src/features/security/infrastructure/security.repository";
import { AuthRepositorySql } from "../../infrastructure/auth.repository.sql";
import { SecurityRepositorySql } from "src/features/security/infrastructure/security.repository.sql";


export class AddRefreshTokenInBlackListCommand {
    constructor(
        public refreshToken: string,
        public deviceId?: string
    ) { }
}

@CommandHandler(AddRefreshTokenInBlackListCommand)
export class AddRefreshTokenInBlackListUseCase {
    constructor(
        // private authRepository: AuthRepository,
        private authRepositorySql: AuthRepositorySql,
        private securityRepositorySql: SecurityRepositorySql,
        // private securityRepository: SecurityRepository
    ) { }

    async execute(command: AddRefreshTokenInBlackListCommand) {

        const { refreshToken, deviceId } = command

        await this.authRepositorySql.postRefreshTokenInBlackList(refreshToken)

        if (deviceId) {
            const isDeleteDevice = await this.securityRepositorySql.deleteDeviceById(deviceId)
            return isDeleteDevice
        }

        // await this.authRepository.save(token)
        return true
    }
}