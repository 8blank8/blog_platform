import { CommandHandler } from "@nestjs/cqrs";
// import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import bcrypt from 'bcrypt'
import { UserQueryRepositorySql } from "../../../../features/user/infrastructure/user.query.repository.sql";


export class ValidateUserCommand {
    constructor(
        public loginOrEmail: string,
        public password: string
    ) { }
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase {
    constructor(
        // private userQueryRepository: UserQueryRepository
        private userQueryRepositorySql: UserQueryRepositorySql
    ) { }

    async execute(command: ValidateUserCommand) {

        const { loginOrEmail, password } = command

        const user = await this.userQueryRepositorySql.findUserByLoginOrEmail(loginOrEmail)
        if (!user || user.isBanned) return null

        const newPasswordHash: string = await bcrypt.hash(password, user.passwordSalt)
        if (user.passwordHash !== newPasswordHash) return null

        return { id: user.id, login: user.login }
    }
}