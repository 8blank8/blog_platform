import { CommandHandler } from "@nestjs/cqrs";
import { ConfirmationCodeType } from "src/utils/custom-validation/confirmation.code.type";
import { UserRepositoryTypeorm } from "../../infrastructure/typeorm/user.repository.typeorm";
import { UserQueryRepositoryTypeorm } from "../../infrastructure/typeorm/user.query.repository.typeorm";

export class EmailConfirmationCommand {
    constructor(
        public code: ConfirmationCodeType
    ) { }
}

@CommandHandler(EmailConfirmationCommand)
export class EmailConfirmationUseCase {
    constructor(
        private userRepository: UserRepositoryTypeorm,
        private userQueryRepository: UserQueryRepositoryTypeorm
    ) { }

    async execute(command: EmailConfirmationCommand): Promise<boolean> {

        const { code } = command

        const user = await this.userQueryRepository.findConfirmationCodeUser(code.code)
        if (!user || user.isConfirmed === true) return false

        user.isConfirmed = true
        await this.userRepository.saveUserConfirmation(user)

        return true
    }
}