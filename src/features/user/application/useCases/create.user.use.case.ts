import { CommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { UserCreateType } from '@user/models/user.create.type';
import { UserRepositoryTypeorm } from '@user/repository/typeorm/user.repository.typeorm';
import { Users } from '@user/domain/typeorm/user.entity';
import { UsersPassword } from '@user/domain/typeorm/user.password.entity';
import { UsersConfirmationEmail } from '@user/domain/typeorm/user.confirmation.email.entity';

export class CreateUserCommand {
  constructor(public user: UserCreateType) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(private userRepository: UserRepositoryTypeorm) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const { user } = command;

    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(user.password, passwordSalt);

    const createdUser = new Users();
    createdUser.login = user.login;
    createdUser.email = user.email;

    const passwordUser = new UsersPassword();
    passwordUser.passwordHash = passwordHash;
    passwordUser.passwordSalt = passwordSalt;
    passwordUser.user = createdUser;

    const confirmationUser = new UsersConfirmationEmail();
    confirmationUser.code = uuidv4();
    confirmationUser.isConfirmed = true;
    confirmationUser.user = createdUser;

    await this.userRepository.saveUser(createdUser);
    await this.userRepository.saveUserPassword(passwordUser);
    await this.userRepository.saveUserConfirmation(confirmationUser);

    return createdUser.id;
  }
}
