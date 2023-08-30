import { CommandHandler } from "@nestjs/cqrs";
import { UserRepository } from "../../infrastructure/user.repository";
import { UserRepositorySql } from "../../infrastructure/user.repository.sql";
import { UserQueryRepositorySql } from "../../infrastructure/user.query.repository.sql";


export class DeleteUserCommand {
    constructor(
        public id: string
    ) { }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
    constructor(
        // private userRepository: UserRepository,
        private userRepositorySql: UserRepositorySql,
        private userQueryRepositorySql: UserQueryRepositorySql
    ) { }

    async execute(command: DeleteUserCommand) {

        const { id } = command
        const user = await this.userQueryRepositorySql.findUser(id)
        if (!user) return false

        await this.userRepositorySql.deleteUser(id)
        return true
    }
}