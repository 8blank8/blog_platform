import { CommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import { UserQueryRepositoryTypeorm } from '../../../../features/user/infrastructure/typeorm/user.query.repository.typeorm';

export class ValidateUserCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase {
  constructor(private userQueryRepository: UserQueryRepositoryTypeorm) {}

  async execute(command: ValidateUserCommand) {
    const { loginOrEmail, password } = command;

    const user = await this.userQueryRepository.findUserByLoginOrEmail(
      loginOrEmail,
    );
    if (!user) return null;

    const newPasswordHash: string = await bcrypt.hash(
      password,
      user.password.passwordSalt,
    );
    if (user.password.passwordHash !== newPasswordHash) return null;

    return { id: user.id, login: user.login };
  }
}
