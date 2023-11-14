import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { UserQueryRepositoryTypeorm } from '../../features/user/infrastructure/typeorm/user.query.repository.typeorm';

@ValidatorConstraint({ name: 'UserExistLogin', async: true })
@Injectable()
export class UserExistLogin implements ValidatorConstraintInterface {
  constructor(private userQueryRepository: UserQueryRepositoryTypeorm) {}

  async validate(login: string) {
    try {
      const isLogin = await this.userQueryRepository.findUserByLoginOrEmail(
        login,
      );
      if (isLogin) return false;
    } catch (e) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return `Login doesn't exist`;
  }
}
