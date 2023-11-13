import { CommandHandler } from "@nestjs/cqrs";
import { EmailType } from "../../../auth/api/models/email.type";
import { v4 as uuidv4 } from 'uuid'
import { EmailManager } from "../../../../utils/managers/email.manager";
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
        private userRepository: UserRepositoryTypeorm,
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private emailManager: EmailManager
    ) { }

    async execute(command: ResendingConfirmationCodeCommand): Promise<boolean> {

        const { email } = command

        const user = await this.userQueryRepository.findUserByEmailWithConfirmationEmail(email.email)
        if (!user || user.confirmationInfo.isConfirmed === true) return false

        const confirmationCode = uuidv4()

        const userConfirmation = await this.userQueryRepository.findConfirmationCodeUser(user.confirmationInfo.code)
        if (!userConfirmation) return false

        userConfirmation.code = confirmationCode
        await this.userRepository.saveUserConfirmation(userConfirmation)

        this.emailManager.sendEmailConfirmationMessage(user.email, confirmationCode)

        return true
    }
}