import { CommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { UserCreateType } from '@user/models/user.create.type';
import { UserRepositoryTypeorm } from '@user/repository/typeorm/user.repository.typeorm';
import { EmailManager } from '@utils/managers/email.manager';
import { Users } from '@user/domain/typeorm/user.entity';
import { UsersPassword } from '@user/domain/typeorm/user.password.entity';
import { UsersConfirmationEmail } from '@user/domain/typeorm/user.confirmation.email.entity';
import { UserBanned } from '@user/domain/typeorm/user.banned.entity';

export class RegistrationUserCommand {
  constructor(public user: UserCreateType) { }
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase {
  constructor(
    private userRepository: UserRepositoryTypeorm,
    private emailManager: EmailManager,
  ) { }

  async execute(command: RegistrationUserCommand): Promise<boolean> {
    const { user } = command;

    const passwordSalt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(user.password, passwordSalt);

    const confirmationCode: string = uuidv4();

    const createdUser = new Users();
    createdUser.login = user.login;
    createdUser.email = user.email;

    const createdUserPassword = new UsersPassword();
    createdUserPassword.passwordHash = passwordHash;
    createdUserPassword.passwordSalt = passwordSalt;
    createdUserPassword.user = createdUser;

    const createdConfirmationEmail = new UsersConfirmationEmail();
    createdConfirmationEmail.isConfirmed = false;
    createdConfirmationEmail.code = confirmationCode;
    createdConfirmationEmail.user = createdUser;

    const userBanned = new UserBanned()
    userBanned.user = createdUser

    await this.userRepository.saveUser(createdUser);
    await this.userRepository.saveUserConfirmation(createdConfirmationEmail);
    await this.userRepository.saveUserPassword(createdUserPassword);
    await this.userRepository.saveUserBanned(userBanned)

    this.emailManager.sendEmailConfirmationMessage(
      user.email,
      confirmationCode,
    );

    return true;
  }
}
