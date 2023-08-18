import { CommandHandler } from "@nestjs/cqrs";
import { UserCreateType } from "../../models/user.create.type";
import { v4 as uuidv4 } from 'uuid'
import { UserRepository } from "../../infrastructure/user.repository";


export class CreateUserCommand {
    constructor(
        public user: UserCreateType
    ) { }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
    constructor(
        private userRepository: UserRepository,
    ) { }

    async execute(command: CreateUserCommand): Promise<string> {

        const { user } = command

        const newUser = await this.userRepository.createUser(user)
        newUser.addId()
        newUser.addCreatedAt()
        await newUser.setPassWordHash(user.password)

        const confirmationCode = uuidv4()
        newUser.addConfirmationCode(confirmationCode)
        newUser.confirmationEmail()

        await this.userRepository.save(newUser)

        return newUser.id
    }
}