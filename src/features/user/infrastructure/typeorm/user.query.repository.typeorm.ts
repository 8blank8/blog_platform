import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPagination } from '@utils/pagination/user/user.pagination';
import { UsersConfirmationEmail } from '@user/domain/typeorm/user.confirmation.email.entity';
import { Users } from '@user/domain/typeorm/user.entity';
import { UserQueryParamType } from '@user/models/user.query.param.type';
import { Repository } from 'typeorm';
import { UserBanned } from '@user/domain/typeorm/user.banned.entity';
import { UserTelegramProfile } from '@user/domain/typeorm/user.telegram.profile.entity';

@Injectable()
export class UserQueryRepositoryTypeorm {
  constructor(
    @InjectRepository(Users) private userQueryRepository: Repository<Users>,
    @InjectRepository(UsersConfirmationEmail)
    private userConfirmationEmailRepository: Repository<UsersConfirmationEmail>,
    @InjectRepository(UserBanned) private userBannedRepository: Repository<UserBanned>,
    @InjectRepository(UserTelegramProfile) private userTelegramProfileRepository: Repository<UserTelegramProfile>
  ) { }

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<Users | null> {
    const user = await this.userQueryRepository
      .createQueryBuilder('u')
      .where('u.email ilike :email', { email: loginOrEmail })
      .orWhere('u.login ilike :login', { login: loginOrEmail })
      .leftJoinAndSelect('u.password', 'p')
      .leftJoinAndSelect('u.banInfo', 'ban')
      .getOne();

    return user;
  }

  async findUserByIdForSa(userId: string): Promise<Users | null> {
    const user = await this.userQueryRepository
      .createQueryBuilder('u')
      .where('u.id = :userId', { userId: userId })
      .leftJoinAndSelect('u.banInfo', 'ban')
      // .leftJoinAndSelect('u.telegramProfile', 't')
      .getOne();

    return user;
  }

  async findTelegramProfileByUserId(userId: string): Promise<UserTelegramProfile | null> {
    const profile = await this.userTelegramProfileRepository.createQueryBuilder('p')
      .where('p.userId = :userId', { userId })
      .getOne()

    return profile
  }

  async findUserWitchBanInfo(userId: string) {
    const user = await this.userQueryRepository
      .createQueryBuilder('u')
      .where('u.id = :userId', { userId: userId })
      .leftJoinAndSelect('u.banInfo', 'ban')
      .getOne();

    if (!user) return null
    return this._mapUserWitchBanInfo(user);
  }

  async findUserByEmailWithConfirmationEmail(
    email: string,
  ): Promise<Users | null> {
    const user = await this.userQueryRepository
      .createQueryBuilder('u')
      .where('email = :email', { email })
      .leftJoinAndSelect('u.confirmationInfo', 'ci')
      .getOne();
    return user;
  }

  async findConfirmationCodeUser(
    code: string,
  ): Promise<UsersConfirmationEmail | null> {
    const user = await this.userConfirmationEmailRepository
      .createQueryBuilder('c')
      .where('code = :code', { code })
      .getOne();

    return user;
  }

  async findMe(userId: string) {
    const user = await this.userQueryRepository
      .createQueryBuilder('u')
      .where('id = :userId', { userId })
      .getOne();

    if (!user) return null;

    return this._mapUserViewByMe(user);
  }

  async findAllUsers(queryParam: UserQueryParamType) {
    const pagination = new UserPagination(queryParam).getPaginationUserForSql();

    const {
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      offset,
      pageSize,
      pageNumber,
      sortDirection,
      banStatus
    } = pagination;

    const queryBuilderUser = this.userQueryRepository.createQueryBuilder('u');
    const queryBuilderTotalCount =
      this.userQueryRepository.createQueryBuilder('u');

    const totalCount = await queryBuilderTotalCount
      .where(
        `(u.login ILIKE :searchLoginTerm OR u.email ILIKE :searchEmailTerm) AND (ban.isBanned = ${banStatus.banStatus1} OR ban.isBanned = ${banStatus.banStatus2})`,
        { searchLoginTerm, searchEmailTerm },
      )
      .leftJoinAndSelect('u.banInfo', 'ban')
      .getCount();

    const users = await queryBuilderUser
      .where(
        `(u.login ILIKE :searchLoginTerm OR u.email ILIKE :searchEmailTerm) AND (ban.isBanned = ${banStatus.banStatus1} OR ban.isBanned = ${banStatus.banStatus2})`,
        { searchLoginTerm, searchEmailTerm },
      )
      .leftJoinAndSelect('u.banInfo', 'ban')
      .orderBy(
        `"${sortBy}" ${sortBy === 'createdAt' ? '' : 'COLLATE "C"'}`,
        `${sortDirection}`,
      )
      .offset(+offset)
      .limit(+pageSize)
      .getMany();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount,
      items: users.map(user => this._mapUserWitchBanInfo(user)),
    };
  }

  async findBanInfoByUserId(userId: string): Promise<UserBanned | null> {
    const banInfo = await this.userBannedRepository.createQueryBuilder('u')
      .where('u."userId" = :userId', { userId })
      .getOne()

    return banInfo
  }

  async findUserByTelegramCode(code: string): Promise<Users | null> {
    const user = await this.userQueryRepository.createQueryBuilder('u')
      .where('u.telegramCode = :code', { code })
      // .leftJoinAndSelect('u.telegramProfile', 't')
      .getOne()

    return user
  }

  private _mapUserWitchBanInfo(user: Users) {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate,
        banReason: user.banInfo.banReason
      }
    }
  }

  private _mapUserViewByMe(user: Users) {
    return {
      userId: user.id,
      login: user.login,
      email: user.email,
    };
  }
}
