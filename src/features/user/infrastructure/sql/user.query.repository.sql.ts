import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QUERY_PARAM_SQL } from '@app/utils/enum/query.param.enum.sql';

import { UserViewSqlModel } from '../models/queryRepositorySql/user.view.sql.model';
import { UserWithPasswordViewSqlModel } from '../models/queryRepositorySql/user.with.password.view.sql.model';
import { UserMeViewSqlModel } from '../models/queryRepositorySql/user.me.view.sql.model';
import { UserConfirmationCodeViewSqlModel } from '../models/queryRepositorySql/user.confirmation.code.view.sql.model';
import { UserWithConfirmationSqlModel } from '../models/queryRepositorySql/user.with.confirmation.sql.model';
import { UserQueryParamType } from '../../models/user.query.param.type';
import { UserViewForSaModel } from '../models/queryRepositorySql/users.view.for.sa.model';
import { UserBannedSqlModel } from '../models/queryRepositorySql/user.banned.sql.model';

@Injectable()
export class UserQueryRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findAllUsers(): Promise<UserViewSqlModel[]> {
    const users = await this.dataSource.query(`
        SELECT * FROM "Users"
        `);

    return users.map(this._mapUser);
  }

  async findAllUsersForSa(queryParam: UserQueryParamType) {
    let {
      sortBy = QUERY_PARAM_SQL.SORT_BY,
      sortDirection = QUERY_PARAM_SQL.SORT_DIRECTION_DESC,
      pageNumber = QUERY_PARAM_SQL.PAGE_NUMBER,
      pageSize = QUERY_PARAM_SQL.PAGE_SIZE,
      searchLoginTerm = QUERY_PARAM_SQL.SEARCH_NAME_TERM,
      searchEmailTerm = QUERY_PARAM_SQL.SEARCH_NAME_TERM,
      banStatus = QUERY_PARAM_SQL.BAN_STATUS_All,
    } = queryParam;

    const page = (+pageNumber - 1) * +pageSize;

    if (sortBy) {
      const [first, ...last] = sortBy.split('');
      sortBy = first.toUpperCase() + last.join('');
    }

    const users = await this.dataSource.query(
      `
            SELECT u."Id", u."Login", u."Email", u."CreatedAt",
		        ub."IsBanned", ub."BanDate", ub."BanReason"
	        FROM public."Users" u
	        LEFT JOIN "UsersBannedSa" ub
	        ON u."Id" = ub."UserId"
	        WHERE (u."Login" ILIKE $1 OR u."Email" ILIKE $2)
            ${
              banStatus === 'banned'
                ? 'AND ub."IsBanned" = true'
                : banStatus === 'notBanned'
                ? 'AND ub."IsBanned" is null'
                : ''
            }
	        ORDER BY  u."${sortBy}" ${
        sortBy !== 'CreatedAt' ? 'COLLATE "C"' : ''
      } ${sortDirection} 
	        OFFSET $3 LIMIT $4
        `,
      [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`, page, pageSize],
    );

    const totalCount = await this.dataSource.query(
      `
            SELECT COUNT(*)
            FROM public."Users" u
            LEFT JOIN "UsersBannedSa" ub
            ON u."Id" = ub."UserId"
            WHERE (u."Login" ILIKE $1 OR u."Email" ILIKE $2)
            ${
              banStatus === 'banned'
                ? 'AND ub."IsBanned" = true'
                : banStatus === 'notBanned'
                ? 'AND ub."IsBanned" is null'
                : ''
            }
        `,
      [`%${searchLoginTerm}%`, `%${searchEmailTerm}%`],
    );

    return {
      pagesCount: Math.ceil(totalCount[0].count / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +totalCount[0].count,
      items: users.map(this._mapUserForSa),
    };
  }

  async findUserByIdForSa(userId: string): Promise<UserViewForSaModel> {
    const user = await this.dataSource.query(
      `
            SELECT u."Id", u."Login", u."Email", u."CreatedAt",
		        ub."IsBanned", ub."BanDate", ub."BanReason"
	        FROM public."Users" u
	        LEFT JOIN "UsersBannedSa" ub
	        ON u."Id" = ub."UserId"
            WHERE u."Id" = $1
        `,
      [userId],
    );

    return user.map(this._mapUserForSa)[0];
  }

  async findUser(userId: string): Promise<UserViewSqlModel> {
    const user = await this.dataSource.query(
      `
        SELECT "Id", "Login", "Email", "CreatedAt"
	    FROM public."Users"
	    WHERE "Id" = $1;
        `,
      [userId],
    );

    return user.map(this._mapUser)[0];
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserWithPasswordViewSqlModel> {
    const user = await this.dataSource.query(
      `
        SELECT u."Id", u."Login", u."Email", u."CreatedAt", 
		        up."PasswordHash", up."PasswordSalt", ub."IsBanned"
	        FROM public."Users" u
        LEFT JOIN "UsersPassword" up
        ON u."Id" = up."UserId"
        LEFT JOIN "UsersBannedSa" ub
        ON u."Id" = ub."UserId"
        WHERE u."Login" = $1 OR u."Email" = $1
        `,
      [loginOrEmail],
    );

    return user.map(this._mapUserWithPassword)[0];
  }

  async findMe(userId: string): Promise<UserMeViewSqlModel> {
    const user = await this.dataSource.query(
      `
        SELECT "Id", "Login", "Email"
	    FROM public."Users"
	    WHERE "Id" = $1;
        `,
      [userId],
    );

    return user.map(this._mapUserMe)[0];
  }

  async findConfirmationCodeUser(
    confirmationCode: string,
  ): Promise<UserConfirmationCodeViewSqlModel> {
    const confirmationCodeUser = await this.dataSource.query(
      `
        SELECT "Id", "UserId", "IsConfirmed", "Code"
	    FROM public."UsersConfirmationEmail"
	    WHERE "Code" = $1;
        `,
      [confirmationCode],
    );

    return confirmationCodeUser.map(this._mapConfirmationCodeUser)[0];
  }

  async findUserByEmailWithConfirmationEmail(
    email: string,
  ): Promise<UserWithConfirmationSqlModel> {
    const user = await this.dataSource.query(
      `
            SELECT u."Id", u."Login", u."Email", u."CreatedAt",
		        uc."IsConfirmed"
	        FROM public."Users" u
	        LEFT JOIN "UsersConfirmationEmail" uc
	        ON u."Id" = uc."UserId"
	        WHERE u."Email" = $1;
        `,
      [email],
    );

    return user.map(this._mapUserWithConfirmation)[0];
  }

  async findBannedUserByIdForSa(
    userId: string,
  ): Promise<UserBannedSqlModel | null> {
    const user = await this.dataSource.query(
      `
            SELECT "Id", "UserId", "BanDate", "BanReason", "IsBanned"
            FROM public."UsersBannedSa"
            WHERE "UserId" = $1;
        `,
      [userId],
    );

    if (!user[0]) return null;

    return user.map(this._mapBannedUser);
  }

  _mapBannedUser(user): UserBannedSqlModel {
    const banDate =
      user.BanDate === null ? null : new Date(user.BanDate).toISOString();

    return {
      id: user.Id,
      userId: user.UserId,
      banDate: banDate,
      banReason: user.BanReason,
      isBanned: user.IsBanned ?? false,
    };
  }

  _mapUserForSa(user): UserViewForSaModel {
    // const banDate =
    //   user.BanDate === null ? null : new Date(user.BanDate).toISOString();

    return {
      id: user.Id,
      login: user.Login,
      email: user.Email,
      createdAt: user.CreatedAt,
    };
  }

  _mapUserWithConfirmation(user): UserWithConfirmationSqlModel {
    return {
      id: user.Id,
      login: user.Login,
      email: user.Email,
      createdAt: user.CreatedAt,
      isConfirmed: user.IsConfirmed,
    };
  }

  _mapConfirmationCodeUser(
    userConfirmationCode,
  ): UserConfirmationCodeViewSqlModel {
    return {
      id: userConfirmationCode.Id,
      userId: userConfirmationCode.UserId,
      isConfirmed: userConfirmationCode.IsConfirmed,
      confirmationCode: userConfirmationCode.Code,
    };
  }

  _mapUser(user): UserViewSqlModel {
    return {
      id: user.Id,
      login: user.Login,
      email: user.Email,
      createdAt: user.CreatedAt,
    };
  }

  _mapUserMe(user): UserMeViewSqlModel {
    return {
      email: user.Email,
      login: user.Login,
      userId: user.Id,
    };
  }

  _mapUserWithPassword(user): UserWithPasswordViewSqlModel {
    return {
      id: user.Id,
      login: user.Login,
      email: user.Email,
      createdAt: user.CreatedAt,
      passwordHash: user.PasswordHash,
      passwordSalt: user.PasswordSalt,
      isBanned: user.IsBanned,
    };
  }
}
