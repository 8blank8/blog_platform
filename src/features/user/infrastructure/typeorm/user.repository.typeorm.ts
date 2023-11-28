import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '@user/domain/typeorm/user.entity';
import { UsersConfirmationEmail } from '@user/domain/typeorm/user.confirmation.email.entity';
import { UsersPassword } from '@user/domain/typeorm/user.password.entity';
import { UserBanned } from '@user/domain/typeorm/user.banned.entity';
import { UserTelegramProfile } from '@user/domain/typeorm/user.telegram.profile.entity';

@Injectable()
export class UserRepositoryTypeorm {
  constructor(
    @InjectRepository(Users) private userRepository: Repository<Users>,
    @InjectRepository(UsersConfirmationEmail)
    private userConfirmationRepository: Repository<UsersConfirmationEmail>,
    @InjectRepository(UsersPassword)
    private userPasswordRepository: Repository<UsersPassword>,
    @InjectRepository(UserBanned) private userBannedRepository: Repository<UserBanned>,
    @InjectRepository(UserTelegramProfile) private userTelegramProfileRepository: Repository<UserTelegramProfile>
  ) { }

  async saveUser(user: Users) {
    return this.userRepository.save(user);
  }

  async saveUserConfirmation(userConfirmation: UsersConfirmationEmail) {
    return this.userConfirmationRepository.save(userConfirmation);
  }

  async saveUserPassword(userPassword: UsersPassword) {
    return this.userPasswordRepository.save(userPassword);
  }

  async saveUserBanned(banInfo: UserBanned) {
    return this.userBannedRepository.save(banInfo)
  }

  async saveTelegramProfile(profile: UserTelegramProfile) {
    return this.userTelegramProfileRepository.save(profile)
  }

  async deleteUser(userId: string) {
    return this.userRepository.delete({ id: userId });
  }
}
