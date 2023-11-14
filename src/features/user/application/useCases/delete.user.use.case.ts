import { CommandHandler } from '@nestjs/cqrs';
import { UserQueryRepositoryTypeorm } from '@user/repository/typeorm/user.query.repository.typeorm';
import { UserRepositoryTypeorm } from '@user/repository/typeorm/user.repository.typeorm';

export class DeleteUserCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
  constructor(
    private userRepository: UserRepositoryTypeorm,
    private userQueryRepository: UserQueryRepositoryTypeorm,
  ) {}

  async execute(command: DeleteUserCommand) {
    const { id } = command;
    console.log(id);
    const user = await this.userQueryRepository.findUserByIdForSa(id);
    if (!user) return false;

    await this.userRepository.deleteUser(id);
    return true;
  }
}
