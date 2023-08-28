import { CommandHandler } from "@nestjs/cqrs";
import { ConfirmationCodeType } from "src/features/auth/models/confirmation.code.type";
import { UserRepository } from "../../infrastructure/user.repository";
import { UserQueryRepository } from "../../infrastructure/user.query.repository";
import { UserQueryRepositorySql } from "../../infrastructure/user.query.repository.sql";

export class EmailConfirmationCommand {
    constructor(
        public code: ConfirmationCodeType
    ) { }
}

@CommandHandler(EmailConfirmationCommand)
export class EmailConfirmationUseCase {
    constructor(
        private userRepository: UserRepository,
        // private userQueryRepository: UserQueryRepository,
        private userQueryRepositorySql: UserQueryRepositorySql
    ) { }

    async execute(command: EmailConfirmationCommand): Promise<boolean> {

        const { code } = command

        const user = await this.userQueryRepositorySql.findConfirmationCodeUser(code.code)
        if (!user || user.isConfirmed === true) return false

        // user.confirmationEmail()
        // await this.userRepository.save(user)
        return true
    }
}