import { CommandHandler } from "@nestjs/cqrs";
import { EmailType } from "../../../../features/auth/models/email.type";
import { v4 as uuidv4 } from 'uuid'
// import { UserRepository } from "../../infrastructure/user.repository";
// import { UserQueryRepository } from "../../infrastructure/user.query.repository";
import { EmailManager } from "../../../../entity/managers/email.manager";
import { UserQueryRepositorySql } from "../../infrastructure/sql/user.query.repository.sql";
import { UserRepositorySql } from "../../infrastructure/sql/user.repository.sql";


export class ResendingConfirmationCodeCommand {
    constructor(
        public email: EmailType
    ) { }
}

@CommandHandler(ResendingConfirmationCodeCommand)
export class ResendingConfirmationCodeUseCase {
    constructor(
        // private userRepository: UserRepository,
        // private userQueryRepository: UserQueryRepository,
        private userRepositorySql: UserRepositorySql,
        private userQueryRepositorySql: UserQueryRepositorySql,
        private emailManager: EmailManager
    ) { }

    async execute(command: ResendingConfirmationCodeCommand): Promise<boolean> {

        const { email } = command

        const user = await this.userQueryRepositorySql.findUserByEmailWithConfirmationEmail(email.email)
        if (!user || user.isConfirmed === true) return false

        const confirmationCode = uuidv4()

        await this.userRepositorySql.updateConfirmationCode(user.id, confirmationCode)
        // user.addConfirmationCode(confirmationCode)
        this.emailManager.sendEmailConfirmationMessage(user.email, confirmationCode)

        // this.userRepository.save(user)
        return true
    }
}