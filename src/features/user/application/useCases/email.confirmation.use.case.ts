import { CommandHandler } from "@nestjs/cqrs";
import { ConfirmationCodeType } from "src/features/auth/models/confirmation.code.type";
import { UserRepository } from "../../infrastructure/mongo/user.repository";
import { UserQueryRepository } from "../../infrastructure/mongo/user.query.repository";
import { UserQueryRepositorySql } from "../../infrastructure/sql/user.query.repository.sql";
import { UserRepositorySql } from "../../infrastructure/sql/user.repository.sql";

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
        private userRepositorySql: UserRepositorySql,
        private userQueryRepositorySql: UserQueryRepositorySql
    ) { }

    async execute(command: EmailConfirmationCommand): Promise<boolean> {

        const { code } = command

        const confirmationData = await this.userQueryRepositorySql.findConfirmationCodeUser(code.code)
        if (!confirmationData || confirmationData.isConfirmed === true) return false

        await this.userRepositorySql.updateConfirmationEmail(true, confirmationData.userId)
        // user.confirmationEmail()
        // await this.userRepository.save(user)
        return true
    }
}