import { Injectable } from "@nestjs/common";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";


@Injectable()
export class AuthService {
    constructor(private readonly userQueryRepository: UserQueryRepository) { }

    async validateUser(loginOrEmail: string, password: string): Promise<boolean> {
        const user = await this.userQueryRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) return false

        const isValidate = await user.validatePassword(password)
        if (!isValidate) return false

        return true
    }
}
