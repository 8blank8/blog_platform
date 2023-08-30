import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { UserViewType } from "../models/user.view.type";
import { UserViewSqlModel } from "./models/queryRepositorySql/user.view.sql.model";
import { UserWithPasswordViewSqlModel } from "./models/queryRepositorySql/user.with.password.view.sql.model";
import { UserMeViewSqlModel } from "./models/queryRepositorySql/user.me.view.sql.model";
import { UserConfirmationCodeViewSqlModel } from "./models/queryRepositorySql/user.confirmation.code.view.sql.model";
import { UserWithConfirmationSqlModel } from "./models/queryRepositorySql/user.with.confirmation.sql.model";
import { UserQueryParamType } from "../models/user.query.param.type";
import { QUERY_PARAM_SQL } from "../../../entity/enum/query.param.enum.sql";
import { UserViewForSaModel } from "./models/queryRepositorySql/users.view.for.sa.model";


@Injectable()
export class UserQueryRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async findAllUsers(): Promise<UserViewSqlModel[]> {
        const users = await this.dataSource.query(`
        SELECT * FROM "Users"
        `)

        return users.map(this._mapUser)
    }

    async findAllUsersForSa(queryParam: UserQueryParamType): Promise<UserViewForSaModel[]> {

        const {
            sortBy = QUERY_PARAM_SQL.SORT_BY,
            sortDirection = QUERY_PARAM_SQL.SORT_DIRECTION_DESC,
            pageNumber = QUERY_PARAM_SQL.PAGE_NUMBER,
            pageSize = QUERY_PARAM_SQL.PAGE_SIZE,
            searchLoginTerm = QUERY_PARAM_SQL.SEARCH_NAME_TERM,
            searchEmailTerm = QUERY_PARAM_SQL.SEARCH_NAME_TERM,
            banStatus = QUERY_PARAM_SQL.BAN_STATUS_All
        } = queryParam

        const users = await this.dataSource.query(`
            SELECT u."Id", u."Login", u."Email", u."CreatedAt",
		        ub."IsBanned", ub."BanDate", ub."BanReason"
	        FROM public."Users" u
	        LEFT JOIN "UsersBannedSa" ub
	        ON u."Id" = ub."UserId"
	        WHERE u."Login" LIKE '%' OR u."Email" LIKE '%'
	        ORDER BY u."${sortBy}" ${sortDirection}
	        -- OFFSET 0 LIMIT 1
        `)

        return users.map(this._mapUserForSa)
    }

    async findUser(userId: string): Promise<UserViewSqlModel> {
        const user = await this.dataSource.query(`
        SELECT "Id", "Login", "Email", "CreatedAt"
	    FROM public."Users"
	    WHERE "Id" = $1;
        `, [userId])

        return user.map(this._mapUser)[0]
    }

    async findUserByLoginOrEmail(loginOrEmail: string): Promise<UserWithPasswordViewSqlModel> {
        const user = await this.dataSource.query(`
        SELECT u."Id", u."Login", u."Email", u."CreatedAt", 
		        up."PasswordHash", up."PasswordSalt", ub."IsBanned"
	        FROM public."Users" u
        LEFT JOIN "UsersPassword" up
        ON u."Id" = up."UserId"
        LEFT JOIN "UsersBannedSa" ub
        ON u."Id" = ub."UserId"
        WHERE u."Login" = $1 OR u."Email" = $1
        `, [loginOrEmail])

        return user.map(this._mapUserWithPassword)[0]
    }

    async findMe(userId: string): Promise<UserMeViewSqlModel> {
        const user = await this.dataSource.query(`
        SELECT "Id", "Login", "Email"
	    FROM public."Users"
	    WHERE "Id" = $1;
        `, [userId])

        return user.map(this._mapUserMe)[0]
    }

    async findConfirmationCodeUser(confirmationCode: string): Promise<UserConfirmationCodeViewSqlModel> {
        const confirmationCodeUser = await this.dataSource.query(`
        SELECT "Id", "UserId", "IsConfirmed", "Code"
	    FROM public."UsersConfirmationEmail"
	    WHERE "Code" = $1;
        `, [confirmationCode])

        return confirmationCodeUser.map(this._mapConfirmationCodeUser)[0]
    }

    async findUserByEmailWithConfirmationEmail(email: string): Promise<UserWithConfirmationSqlModel> {
        const user = await this.dataSource.query(`
            SELECT u."Id", u."Login", u."Email", u."CreatedAt",
		        uc."IsConfirmed"
	        FROM public."Users" u
	        LEFT JOIN "UsersConfirmationEmail" uc
	        ON u."Id" = uc."UserId"
	        WHERE u."Email" = $1;
        `, [email])

        return user.map(this._mapUserWithConfirmation)[0]
    }

    _mapUserForSa(user): UserViewForSaModel {
        return {
            id: user.Id,
            login: user.Login,
            email: user.Email,
            createdAt: user.CreatedAt,
            banInfo: {
                isBanned: user.IsBanned,
                banDate: user.BanDate,
                banReason: user.BanReason,
            }
        }
    }

    _mapUserWithConfirmation(user): UserWithConfirmationSqlModel {
        return {
            id: user.Id,
            login: user.Login,
            email: user.Email,
            createdAt: user.CreatedAt,
            isConfirmed: user.IsConfirmed
        }
    }

    _mapConfirmationCodeUser(userConfirmationCode): UserConfirmationCodeViewSqlModel {
        return {
            id: userConfirmationCode.Id,
            userId: userConfirmationCode.UserId,
            isConfirmed: userConfirmationCode.IsConfirmed,
            confirmationCode: userConfirmationCode.Code
        }
    }

    _mapUser(user): UserViewSqlModel {
        return {
            id: user.Id,
            login: user.Login,
            email: user.Email,
            createdAt: user.CreatedAt
        }
    }

    _mapUserMe(user): UserMeViewSqlModel {
        return {
            email: user.Email,
            login: user.Login,
            userId: user.Id
        }
    }

    _mapUserWithPassword(user): UserWithPasswordViewSqlModel {
        return {
            id: user.Id,
            login: user.Login,
            email: user.Email,
            createdAt: user.CreatedAt,
            passwordHash: user.PasswordHash,
            passwordSalt: user.PasswordSalt,
            isBanned: user.IsBanned
        }
    }
}