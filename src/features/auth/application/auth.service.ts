import { Injectable } from "@nestjs/common";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { JwtService } from '@nestjs/jwt'
import { AuthRepository } from "../infrastructure/auth.repository";


@Injectable()
export class AuthService {
    constructor(
        private readonly userQueryRepository: UserQueryRepository,
        private readonly jwtService: JwtService,
        private readonly authRepository: AuthRepository
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
            accessToken: this.jwtService.sign({ id: id }, { expiresIn: '10h' }),
        }
    }

    async createRefreshToken(userId: string, deviceId: string): Promise<string | boolean> {
        const refreshToken = this.jwtService.sign({ userId: userId, deviceId: deviceId }, { expiresIn: '20h' })
        return refreshToken
    }

    async addRefreshTokenInBlackList(refreshToken: string) {
        const token = await this.authRepository.postRefreshToken({ refreshToken })
        return await this.authRepository.save(token)
    }
}
