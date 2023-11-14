import { CommandHandler } from '@nestjs/cqrs';
import { UserRepositoryTypeorm } from '../../infrastructure/typeorm/user.repository.typeorm';
import { UserQueryRepositoryTypeorm } from '../../infrastructure/typeorm/user.query.repository.typeorm';

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
