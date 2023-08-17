import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { JwtService } from '@nestjs/jwt'
import { AuthRepository } from "../infrastructure/auth.repository";
import { SecurityQueryRepository } from "src/features/security/infrastructure/security.query.repository";
import { SecurityRepository } from "src/features/security/infrastructure/security.repository";


@Injectable()
export class AuthService {
    constructor(
        private readonly userQueryRepository: UserQueryRepository,
        private readonly jwtService: JwtService,
        private readonly authRepository: AuthRepository,
        private readonly securityQueryRepository: SecurityQueryRepository,
        private readonly securityRepository: SecurityRepository
    ) { }

    async validateUser(loginOrEmail: string, password: string) {
        const user = await this.userQueryRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) return null

        const isValidate = await user.validatePassword(password)
        if (!isValidate) return null

        return { id: user.id, login: user.login }
    }

    async login(id: string) {
        return {
            accessToken: this.jwtService.sign({ id: id }, { expiresIn: '10s' }),
        }
    }

    async createRefreshToken(userId: string, deviceId: string): Promise<string | boolean> {

        const device = await this.securityQueryRepository.findDeviceById(deviceId)
        if (!device) return false

        device.setLastActiveDate()
        await this.securityRepository.saveDevice(device)

        const refreshToken = this.jwtService.sign({ userId: userId, deviceId: deviceId }, { expiresIn: '20s' })
        return refreshToken
    }

    async addRefreshTokenInBlackList(refreshToken: string, deviceId?: string) {
        const token = await this.authRepository.postRefreshToken({ refreshToken })

        if (deviceId) {
            const isDeleteDevice = await this.securityRepository.deleteDevice(deviceId)
            return isDeleteDevice
        }

        await this.authRepository.save(token)
        return
    }
}
