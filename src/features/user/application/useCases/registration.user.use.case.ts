import { CommandHandler } from "@nestjs/cqrs";
import { UserCreateType } from "../../models/user.create.type";
import { v4 as uuidv4 } from 'uuid'
import { UserRepository } from "../../infrastructure/user.repository";
import { EmailManager } from "src/entity/managers/email.manager";
import { UserRepositorySql } from "../../infrastructure/user.repository.sql";
import { CreateUserForRegistrationSqlModel } from "../../infrastructure/models/repositorySql/create.user.for.registration.sql.model";
import bcrypt from 'bcrypt'


export class RegistrationUserCommand {
    constructor(
        public user: UserCreateType
    ) { }
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase {
    constructor(
        // private userRepository: UserRepository,
        private userRepositorySql: UserRepositorySql,
        private emailManager: EmailManager
    ) { }

    async execute(command: RegistrationUserCommand): Promise<boolean> {

        const { user } = command

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(user.password, passwordSalt)

        const confirmationCode: string = uuidv4()

        const createdUser: CreateUserForRegistrationSqlModel = {
            login: user.login,
            email: user.email,
            createdAt: new Date().toISOString(),
            passwordHash: passwordHash,
            passwordSalt: passwordSalt,
            confirmationCode: confirmationCode
        }

        await this.userRepositorySql.createUserForRegistration(createdUser)
        this.emailManager.sendEmailConfirmationMessage(user.email, confirmationCode)

        return true

        // newUser.addId()
        // newUser.addCreatedAt()
        // await newUser.setPassWordHash(user.password)


        // newUser.addConfirmationCode(confirmationCode)

        // await this.userRepository.save(newUser)
    }
}