import { CommandHandler } from "@nestjs/cqrs";
import { UserRepository } from "../../infrastructure/user.repository";
import { UserRepositorySql } from "../../infrastructure/user.repository.sql";


export class DeleteUserCommand {
    constructor(
        public id: string
    ) { }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
    constructor(
        // private userRepository: UserRepository,
        private userRepositorySql: UserRepositorySql
    ) { }

    async execute(command: DeleteUserCommand) {

        const { id } = command

        await this.userRepositorySql.deleteUser(id)
        return true
    }
}