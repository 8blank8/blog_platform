import { CommandHandler } from "@nestjs/cqrs";
import { UserCreateType } from "../../models/user.create.type";
import { v4 as uuidv4 } from 'uuid'
import { UserRepository } from "../../infrastructure/user.repository";
import { UserRepositorySql } from "../../infrastructure/user.repository.sql";
import { CreateUserForSaSqlModel } from "../../infrastructure/models/repositorySql/create.user.for..sa.sql.model";
import bcrypt from 'bcrypt'


export class CreateUserCommand {
    constructor(
        public user: UserCreateType
    ) { }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
    constructor(
        private userRepository: UserRepository,
        private userRepositorySql: UserRepositorySql
    ) { }

    async execute(command: CreateUserCommand): Promise<string> {

        const { user } = command

        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(user.password, passwordSalt)

        const createdUser: CreateUserForSaSqlModel = {
            id: uuidv4(),
            login: user.login,
            email: user.email,
            // createdAt: new Date().toISOString(),
            passwordHash: passwordHash,
            passwordSalt: passwordSalt
        }

        await this.userRepositorySql.createUserForAdmin(createdUser)
        return createdUser.id
        // const newUser = await this.userRepository.createUser(user)
        // newUser.addId()
        // newUser.addCreatedAt()
        // await newUser.setPassWordHash(user.password)

        // const confirmationCode = uuidv4()
        // newUser.addConfirmationCode(confirmationCode)
        // newUser.confirmationEmail()

        // await this.userRepository.save(newUser)

        // return newUser.id
    }
}