import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { UserQueryRepositoryTypeorm } from '../../features/user/infrastructure/typeorm/user.query.repository.typeorm';

@ValidatorConstraint({ name: 'UserExistEmail', async: true })
@Injectable()
export class UserExistEmail implements ValidatorConstraintInterface {
  constructor(private usersQueryRepository: UserQueryRepositoryTypeorm) {}

  async validate(email: string) {
    try {
      const isEmail = await this.usersQueryRepository.findUserByLoginOrEmail(
        email,
      );
      if (isEmail) return false;
    } catch (e) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return `Email doesn't exist`;
  }
}
