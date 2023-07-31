import { Injectable, UnauthorizedException } from "@nestjs/common";
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

    async login(user: { id: string, login: string }) {
        const payload = { id: user.id, login: user.login }
        return {
            accessToken: this.jwtService.sign(payload),
        }
    }

    async createRefreshToken(user: { id: string, login: string }): Promise<string> {
        const payload = { id: user.id, login: user.login }
        return this.jwtService.sign(payload)
    }
}
