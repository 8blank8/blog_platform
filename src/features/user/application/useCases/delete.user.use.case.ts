import { CommandHandler } from "@nestjs/cqrs";
import { UserRepository } from "../../infrastructure/mongo/user.repository";
import { UserRepositorySql } from "../../infrastructure/sql/user.repository.sql";
import { UserQueryRepositorySql } from "../../infrastructure/sql/user.query.repository.sql";
import { UserRepositoryTypeorm } from "../../infrastructure/typeorm/user.repository.typeorm";
import { UserQueryRepositoryTypeorm } from "../../infrastructure/typeorm/user.query.repository.typeorm";


export class DeleteUserCommand {
    constructor(
        public id: string
    ) { }
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
    constructor(
        // private userRepository: UserRepository,
        private userRepository: UserRepositoryTypeorm,
        private userQueryRepository: UserQueryRepositoryTypeorm
    ) { }

    async execute(command: DeleteUserCommand) {

        const { id } = command
        console.log(id)
        const user = await this.userQueryRepository.findUserByIdForSa(id)
        if (!user) return false

        await this.userRepository.deleteUser(id)
        return true
    }
}