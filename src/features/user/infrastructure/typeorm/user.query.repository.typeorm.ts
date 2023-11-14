import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../domain/typeorm/user.entity';
import { Brackets, Repository } from 'typeorm';
import { UserViewSqlModel } from '../models/queryRepositorySql/user.view.sql.model';
import { UserViewForSaModel } from '../models/queryRepositorySql/users.view.for.sa.model';
import { UserQueryParamType } from '../../models/user.query.param.type';
import { QUERY_PARAM } from '../../../../utils/enum/query.param.enum';
import { QUERY_PARAM_SQL } from '../../../../utils/enum/query.param.enum.sql';
import { UsersConfirmationEmail } from '../../domain/typeorm/user.confirmation.email.entity';
import { UserPagination } from '../../../../utils/pagination/user/user.pagination';

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
    // const sortDirection = queryParam.sortDirection === 'asc' ? QUERY_PARAM_SQL.SORT_DIRECTION_ASC : QUERY_PARAM_SQL.SORT_DIRECTION_DESC
    // const searchLoginTerm = queryParam.searchLoginTerm !== undefined ? `%${queryParam.searchLoginTerm}%` : `%${QUERY_PARAM.SEARCH_NAME_TERM}%`
    // const searchEmailTerm = queryParam.searchEmailTerm !== undefined ? `%${queryParam.searchEmailTerm}%` : `%${QUERY_PARAM.SEARCH_NAME_TERM}%`
    // const sortBy = queryParam.sortBy !== undefined ? queryParam.sortBy : QUERY_PARAM.SORT_BY
    // const pageSize = queryParam.pageSize ?? QUERY_PARAM.PAGE_SIZE
    // const offset = queryParam.pageNumber !== undefined ? ((queryParam.pageNumber - 1) * pageSize) : ((QUERY_PARAM.PAGE_NUMBER - 1) * pageSize)
    // const pageNumber = queryParam.pageNumber ?? QUERY_PARAM.PAGE_NUMBER

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
