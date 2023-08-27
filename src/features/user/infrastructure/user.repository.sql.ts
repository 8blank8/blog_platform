import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { CreateUserForSqlModel } from "./models/create.user.for.sql.model";
import { UpdateBannedUserForSqlModel } from "./models/update.banned.user.for.sql.model";


@Injectable()
export class UserRepositorySql {
    constructor(@InjectDataSource() private dataSource: DataSource) { }

    async createUserForAdmin(user: CreateUserForSqlModel): Promise<boolean> {
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
}