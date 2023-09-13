import { CommandHandler } from "@nestjs/cqrs";
import { ConfirmationCodeType } from "src/features/auth/models/confirmation.code.type";
import { UserRepository } from "../../infrastructure/mongo/user.repository";
import { UserQueryRepository } from "../../infrastructure/mongo/user.query.repository";
import { UserQueryRepositorySql } from "../../infrastructure/sql/user.query.repository.sql";
import { UserRepositorySql } from "../../infrastructure/sql/user.repository.sql";
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
        // private userRepository: UserRepository,
        // private userQueryRepository: UserQueryRepository,
        private userRepository: UserRepositoryTypeorm,
        private userQueryRepository: UserQueryRepositoryTypeorm
    ) { }

    async execute(command: EmailConfirmationCommand): Promise<boolean> {

        const { code } = command

        const user = await this.userQueryRepository.findConfirmationCodeUser(code.code)
        if (!user || user.isConfirmed === true) return false

        // await this.userRepository.updateConfirmationEmail(true, confirmationData.userId)
        user.isConfirmed = true
        await this.userRepository.saveUserConfirmation(user)
        // user.confirmationEmail()
        // await this.userRepository.save(user)
        return true
    }
}