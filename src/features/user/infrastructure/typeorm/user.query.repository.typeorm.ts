import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserPagination } from '@src/utils/pagination/user/user.pagination';
import { UsersConfirmationEmail } from '@user/domain/typeorm/user.confirmation.email.entity';
import { Users } from '@user/domain/typeorm/user.entity';
import { UserQueryParamType } from '@user/models/user.query.param.type';
import { Repository } from 'typeorm';

@Injectable()
export class UserQueryRepositoryTypeorm {
  constructor(
    @InjectRepository(Users) private userQueryRepository: Repository<Users>,
    @InjectRepository(UsersConfirmationEmail)
    private userConfirmationEmailRepository: Repository<UsersConfirmationEmail>,
  ) {}

  async findUserByLoginOrEmail(loginOrEmail: string): Promise<Users | null> {
    const user = await this.userQueryRepository
      .createQueryBuilder('u')
      .where('u.email ilike :email', { email: loginOrEmail })
      .orWhere('u.login ilike :login', { login: loginOrEmail })
      .leftJoinAndSelect('u.password', 'p')
      .getOne();

    return user;
  }

  async findUserByIdForSa(userId: string): Promise<Users | null> {
    const user = await this.userQueryRepository
      .createQueryBuilder('u')
      .where('u.id = :userId', { userId: userId })
      .getOne();

    return user;
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
    } = pagination;

    const queryBuilderUser = this.userQueryRepository.createQueryBuilder('u');
    const queryBuilderTotalCount =
      this.userQueryRepository.createQueryBuilder('u');

    const totalCount = await queryBuilderTotalCount
      .where('u.login ILIKE :searchLoginTerm', { searchLoginTerm })
      .orWhere('u.email ILIKE :searchEmailTerm', { searchEmailTerm })
      .getCount();

    const users = await queryBuilderUser
      .where(
        'u.login ILIKE :searchLoginTerm OR u.email ILIKE :searchEmailTerm',
        { searchLoginTerm, searchEmailTerm },
      )
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
      items: users,
    };
  }

  private _mapUserViewByMe(user: Users) {
    return {
      userId: user.id,
      login: user.login,
      email: user.email,
    };
  }
}
