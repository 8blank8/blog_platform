import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateUserForSaSqlModel } from "./models/repositorySql/create.user.for..sa.sql.model";
import { UpdateBannedUserForSqlModel } from "./models/repositorySql/update.banned.user.for.sql.model";
import { CreateUserForRegistrationSqlModel } from "./models/repositorySql/create.user.for.registration.sql.model";


@Injectable()
export class UserRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createUserForAdmin(user: CreateUserForSaSqlModel): Promise<boolean> {
        await this.dataSource.query(`
            INSERT INTO public."Users"(
                "Id", "Login", "Email", "CreatedAt")
            VALUES ($1, $2, $3, $4);
        `, [user.id, user.login, user.email, user.createdAt])

        await this.dataSource.query(`
            INSERT INTO public."UsersPassword"(
                "UserId", "PasswordHash", "PasswordSalt")
                VALUES ($1, $2, $3);
        `, [user.id, user.passwordHash, user.passwordSalt])

        await this.dataSource.query(`
            INSERT INTO public."UsersConfirmationEmail"(
                "UserId", "IsConfirmed")
            VALUES ($1, $2);
        `, [user.id, true])

        return true
    }

    async createUserForRegistration(user: CreateUserForRegistrationSqlModel) {

        const { login, email, createdAt, passwordHash, passwordSalt, confirmationCode } = user

        const createdUser = await this.dataSource.query(`
        INSERT INTO public."Users"(
            "Login", "Email", "CreatedAt")
        VALUES ($1, $2, $3) RETURNING "Id";
        `, [login, email, createdAt])

        const userId = createdUser[0].Id

        await this.dataSource.query(`
        INSERT INTO public."UsersPassword"(
            "UserId", "PasswordHash", "PasswordSalt")
            VALUES ($1, $2, $3);
        `, [userId, passwordHash, passwordSalt])

        await this.dataSource.query(`
        INSERT INTO public."UsersConfirmationEmail"(
            "UserId", "IsConfirmed", "Code")
        VALUES ($1, $2, $3);
        `, [userId, false, confirmationCode])

        return true
    }

    async updateBanUserForSa(banDto: UpdateBannedUserForSqlModel): Promise<boolean> {

        const { userId, isBanned, banDate, banReason } = banDto

        await this.dataSource.query(`
            INSERT INTO public."UsersBannedSa"(
                "UserId", "BanDate", "BanReason", "IsBanned")
            VALUES ($1, $2, $3, $4);
        `, [userId, banDate, banReason, isBanned])

        return true
    }

    async deleteUser(userId: string) {
        await this.dataSource.query(`
        DELETE FROM public."Users"
	    WHERE "Id" = $1;
        `, [userId])
    }

    // TASK  сделать функцию обновления кода емейла юзера
}