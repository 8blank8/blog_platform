import { CommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";


export class LoginUserCommand {
    constructor(
        public id: string
    ) { }
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase {
    constructor(
        private jwtService: JwtService
    ) { }

    async execute(command: LoginUserCommand) {

        const { id } = command

        return {
            accessToken: this.jwtService.sign({ id: id }, { expiresIn: '10s' }),
        }
    }
}