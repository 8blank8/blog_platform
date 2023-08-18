import { CommandHandler } from "@nestjs/cqrs";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";


export class ValidateUserCommand {
    constructor(
        public loginOrEmail: string,
        public password: string
    ) { }
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase {
    constructor(
        private userQueryRepository: UserQueryRepository
    ) { }

    async execute(command: ValidateUserCommand) {

        const { loginOrEmail, password } = command

        const user = await this.userQueryRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) return null

        const isValidate = await user.validatePassword(password)
        if (!isValidate) return null

        return { id: user.id, login: user.login }
    }
}