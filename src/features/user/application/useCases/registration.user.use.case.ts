import { CommandHandler } from "@nestjs/cqrs";
import { UserCreateType } from "../../models/user.create.type";
import { v4 as uuidv4 } from 'uuid'
import { UserRepository } from "../../infrastructure/user.repository";
import { EmailManager } from "src/entity/managers/email.manager";


export class RegistrationUserCommand {
    constructor(
        public user: UserCreateType
    ) { }
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase {
    constructor(
        private userRepository: UserRepository,
        private emailManager: EmailManager
    ) { }

    async execute(command: RegistrationUserCommand): Promise<boolean> {

        const { user } = command

        const newUser = await this.userRepository.createUser(user)
        newUser.addId()
        newUser.addCreatedAt()
        await newUser.setPassWordHash(user.password)

        const confirmationCode: string = uuidv4()
        newUser.addConfirmationCode(confirmationCode)
        await this.emailManager.sendEmailConfirmationMessage(newUser.email, confirmationCode)

        await this.userRepository.save(newUser)
        return true
    }
}