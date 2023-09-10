import { CommandHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import { setting_env } from "../../../../setting.env";


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
            accessToken: this.jwtService.sign({ id: id }, { expiresIn: setting_env.JWT_ACCESS_EXP }),
        }
    }
}