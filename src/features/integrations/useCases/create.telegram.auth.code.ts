import { Injectable } from "@nestjs/common";
import { UserQueryRepositoryTypeorm } from "@user/repository/typeorm/user.query.repository.typeorm";
import { UserRepositoryTypeorm } from "@user/repository/typeorm/user.repository.typeorm";
import { v4 as uuidv4 } from 'uuid'


@Injectable()
export class CreateTelegramAuthCodeUseCase {
    constructor(
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private userRepository: UserRepositoryTypeorm
    ) { }

    async execute(userId: string): Promise<{ link: string } | boolean> {

        const user = await this.userQueryRepository.findUserByIdForSa(userId)
        const profile = await this.userQueryRepository.findTelegramProfileByUserId(userId)
        if (!user || profile) return false

        const code = uuidv4()

        user.telegramCode = code

        await this.userRepository.saveUser(user)

        return { link: `https://t.me/blog_patf_bot?code=${code}` }
    }
}