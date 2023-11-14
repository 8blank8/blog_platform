import { CommandHandler } from '@nestjs/cqrs';
import { UserCreateType } from '../../models/user.create.type';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { Users } from '../../domain/typeorm/user.entity';
import { UsersPassword } from '../../domain/typeorm/user.password.entity';
import { UsersConfirmationEmail } from '../../domain/typeorm/user.confirmation.email.entity';
import { UserRepositoryTypeorm } from '../../infrastructure/typeorm/user.repository.typeorm';

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
