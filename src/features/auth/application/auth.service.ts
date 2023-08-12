import { Injectable } from "@nestjs/common";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { JwtService } from '@nestjs/jwt'


@Injectable()
export class AuthService {
    constructor(
        private readonly userQueryRepository: UserQueryRepository,
        private readonly jwtService: JwtService) { }

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

    async createRefreshToken(userId: string, deviceId: string): Promise<string> {
        return this.jwtService.sign({ userId: userId, deviceId: deviceId }, { expiresIn: '20s' })
    }
}
