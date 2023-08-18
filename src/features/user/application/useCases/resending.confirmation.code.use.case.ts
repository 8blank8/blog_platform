import { CommandHandler } from "@nestjs/cqrs";
import { EmailType } from "src/features/auth/models/email.type";
import { v4 as uuidv4 } from 'uuid'
import { UserRepository } from "../../infrastructure/user.repository";
import { UserQueryRepository } from "../../infrastructure/user.query.repository";
import { EmailManager } from "src/entity/managers/email.manager";


export class ResendingConfirmationCodeCommand {
    constructor(
        public email: EmailType
    ) { }
}

@CommandHandler(ResendingConfirmationCodeCommand)
export class ResendingConfirmationCodeUseCase {
    constructor(
        private userRepository: UserRepository,
        private userQueryRepository: UserQueryRepository,
        private emailManager: EmailManager
    ) { }

    async execute(command: ResendingConfirmationCodeCommand): Promise<boolean> {

        const { email } = command

        const user = await this.userQueryRepository.findByEmail(email.email)
        if (!user || user.isConfirmed === true) return false

        const confirmationCode = uuidv4()
        user.addConfirmationCode(confirmationCode)
        await this.emailManager.sendEmailConfirmationMessage(user.email, confirmationCode)

        this.userRepository.save(user)
        return true
    }
}