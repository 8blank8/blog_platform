import { CommandHandler } from "@nestjs/cqrs";
import { EmailType } from "../../../../features/auth/models/email.type";
import { v4 as uuidv4 } from 'uuid'
// import { UserRepository } from "../../infrastructure/user.repository";
// import { UserQueryRepository } from "../../infrastructure/user.query.repository";
import { EmailManager } from "../../../../utils/managers/email.manager";
import { UserQueryRepositorySql } from "../../infrastructure/sql/user.query.repository.sql";
import { UserRepositorySql } from "../../infrastructure/sql/user.repository.sql";
import { UserRepositoryTypeorm } from "../../infrastructure/typeorm/user.repository.typeorm";
import { UserQueryRepositoryTypeorm } from "../../infrastructure/typeorm/user.query.repository.typeorm";


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
        private userRepository: UserRepositoryTypeorm,
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private emailManager: EmailManager
    ) { }

    async execute(command: ResendingConfirmationCodeCommand): Promise<boolean> {

        const { email } = command

        const user = await this.userQueryRepository.findUserByEmailWithConfirmationEmail(email.email)
        if (!user || user.confirmationInfo.isConfirmed === true) return false

        const confirmationCode = uuidv4()
        // await this.userRepositorySql.updateConfirmationCode(user.id, confirmationCode)

        const userConfirmation = await this.userQueryRepository.findConfirmationCodeUser(user.confirmationInfo.code)
        if (!userConfirmation) return false

        userConfirmation.code = confirmationCode
        await this.userRepository.saveUserConfirmation(userConfirmation)

        // user.addConfirmationCode(confirmationCode)
        this.emailManager.sendEmailConfirmationMessage(user.email, confirmationCode)

        // this.userRepository.save(user)
        return true
    }
}