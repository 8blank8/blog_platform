import { CommandHandler } from "@nestjs/cqrs";
import { UserRepository } from "../../infrastructure/user.repository";


export class DeleteUserCommand {
    constructor(
        public id: string
    ) { }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
    constructor(
        private userRepository: UserRepository,
    ) { }

    async execute(command: DeleteUserCommand) {

        const { id } = command

        return this.userRepository.deleteUser(id)
    }
}