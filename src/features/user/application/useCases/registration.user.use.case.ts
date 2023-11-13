import { CommandHandler } from "@nestjs/cqrs";
import { UserCreateType } from "../../models/user.create.type";
import { v4 as uuidv4 } from 'uuid'
// import { UserRepository } from "../../infrastructure/user.repository";
import { EmailManager } from "../../../../utils/managers/email.manager";
import { UserRepositorySql } from "../../infrastructure/sql/user.repository.sql";
import { CreateUserForRegistrationSqlModel } from "../../infrastructure/models/repositorySql/create.user.for.registration.sql.model";
import bcrypt from 'bcrypt'
import { UserRepositoryTypeorm } from "../../infrastructure/typeorm/user.repository.typeorm";
import { Users } from "../../domain/typeorm/user.entity";
import { UsersPassword } from "../../domain/typeorm/user.password.entity";
import { UsersConfirmationEmail } from "../../domain/typeorm/user.confirmation.email.entity";


export class RegistrationUserCommand {
    constructor(
        public user: UserCreateType
    ) { }
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase {
    constructor(
        // private userRepository: UserRepository,
        private userRepository: UserRepositoryTypeorm,
        private emailManager: EmailManager
    ) { }

    async execute(command: RegistrationUserCommand): Promise<boolean> {

        const { user } = command

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(user.password, passwordSalt)

        const confirmationCode: string = uuidv4()

        // const createdUser: CreateUserForRegistrationSqlModel = {
        //     login: user.login,
        //     email: user.email,
        //     createdAt: new Date().toISOString(),
        //     passwordHash: passwordHash,
        //     passwordSalt: passwordSalt,
        //     confirmationCode: confirmationCode
        // }

        const createdUser = new Users()
        createdUser.login = user.login
        createdUser.email = user.email

        const createdUserPassword = new UsersPassword()
        createdUserPassword.passwordHash = passwordHash
        createdUserPassword.passwordSalt = passwordSalt
        createdUserPassword.user = createdUser

        const createdConfirmationEmail = new UsersConfirmationEmail()
        createdConfirmationEmail.isConfirmed = false
        createdConfirmationEmail.code = confirmationCode
        createdConfirmationEmail.user = createdUser

        await this.userRepository.saveUser(createdUser)
        await this.userRepository.saveUserConfirmation(createdConfirmationEmail)
        await this.userRepository.saveUserPassword(createdUserPassword)


        // await this.userRepositorySql.createUserForRegistration(createdUser)
        this.emailManager.sendEmailConfirmationMessage(user.email, confirmationCode)

        return true

        // newUser.addId()
        // newUser.addCreatedAt()
        // await newUser.setPassWordHash(user.password)


        // newUser.addConfirmationCode(confirmationCode)

        // await this.userRepository.save(newUser)
    }
}