import { Injectable } from "@nestjs/common";
import { UserTelegramProfile } from "@user/domain/typeorm/user.telegram.profile.entity";
import { UserQueryRepositoryTypeorm } from "@user/repository/typeorm/user.query.repository.typeorm";
import { UserRepositoryTypeorm } from "@user/repository/typeorm/user.repository.typeorm";
import { TelegramResponseModel } from "../models/telegram.response.model";


@Injectable()
export class CreateTelegramProfileUseCase {
    constructor(
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private userRepository: UserRepositoryTypeorm
    ) { }

    async execute(code: string, inputData: TelegramResponseModel): Promise<boolean> {

        const user = await this.userQueryRepository.findUserByTelegramCode(code)
        if (!user) return false
        const profile = await this.userQueryRepository.findTelegramProfileByUserId(user.id)
        if (profile) return false

        const telegramProfile = new UserTelegramProfile()
        telegramProfile.telegramId = String(inputData.message.from.id)
        telegramProfile.user = user
        telegramProfile.userId = user.id
        telegramProfile.username = inputData.message.from.username

        // console.log(telegramProfile, 'create telegram profile')

        await this.userRepository.saveTelegramProfile(telegramProfile)
        return true
    }
}