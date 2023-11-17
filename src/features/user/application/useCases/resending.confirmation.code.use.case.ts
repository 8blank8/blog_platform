import { EmailType } from '@auth/models/email.type';
import { CommandHandler } from '@nestjs/cqrs';
import { EmailManager } from '@utils/managers/email.manager';
import { UserQueryRepositoryTypeorm } from '@user/repository/typeorm/user.query.repository.typeorm';
import { UserRepositoryTypeorm } from '@user/repository/typeorm/user.repository.typeorm';
import { v4 as uuidv4 } from 'uuid';

export class ResendingConfirmationCodeCommand {
  constructor(public email: EmailType) {}
}

@CommandHandler(ResendingConfirmationCodeCommand)
export class ResendingConfirmationCodeUseCase {
  constructor(
    private userRepository: UserRepositoryTypeorm,
    private userQueryRepository: UserQueryRepositoryTypeorm,
    private emailManager: EmailManager,
  ) {}

  async execute(command: ResendingConfirmationCodeCommand): Promise<boolean> {
    const { email } = command;

    const user =
      await this.userQueryRepository.findUserByEmailWithConfirmationEmail(
        email.email,
      );
    if (!user || user.confirmationInfo.isConfirmed === true) return false;

    const confirmationCode = uuidv4();

    const userConfirmation =
      await this.userQueryRepository.findConfirmationCodeUser(
        user.confirmationInfo.code,
      );
    if (!userConfirmation) return false;

    userConfirmation.code = confirmationCode;
    await this.userRepository.saveUserConfirmation(userConfirmation);

    this.emailManager.sendEmailConfirmationMessage(
      user.email,
      confirmationCode,
    );

    return true;
  }
}
