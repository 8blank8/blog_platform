import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Users } from '../../domain/typeorm/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersConfirmationEmail } from '../../domain/typeorm/user.confirmation.email.entity';
import { UsersPassword } from '../../domain/typeorm/user.password.entity';

@Injectable()
export class UserRepositoryTypeorm {
  constructor(
    @InjectRepository(Users) private userRepository: Repository<Users>,
    @InjectRepository(UsersConfirmationEmail)
    private userConfirmationRepository: Repository<UsersConfirmationEmail>,
    @InjectRepository(UsersPassword)
    private userPasswordRepository: Repository<UsersPassword>,
  ) {}

  async saveUser(user: Users) {
    return this.userRepository.save(user);
  }

  async saveUserConfirmation(userConfirmation: UsersConfirmationEmail) {
    return this.userConfirmationRepository.save(userConfirmation);
  }

  async saveUserPassword(userPassword: UsersPassword) {
    return this.userPasswordRepository.save(userPassword);
  }

  async deleteUser(userId: string) {
    return this.userRepository.delete({ id: userId });
  }
}
