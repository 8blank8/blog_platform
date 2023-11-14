import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { CreateUserForSaSqlModel } from '@user/models/create.user.for..sa.sql.model';
import { CreateUserForRegistrationSqlModel } from '@user/models/create.user.for.registration.sql.model';
import { UpdateBannedUserForSqlModel } from '@user/models/update.banned.user.for.sql.model';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createUserForAdmin(user: CreateUserForSaSqlModel): Promise<boolean> {
    await this.dataSource.query(
      `
            INSERT INTO public."Users"(
                "Id", "Login", "Email")
            VALUES ($1, $2, $3);
        `,
      [user.id, user.login, user.email],
    );

    await this.dataSource.query(
      `
            INSERT INTO public."UsersPassword"(
                "UserId", "PasswordHash", "PasswordSalt")
                VALUES ($1, $2, $3);
        `,
      [user.id, user.passwordHash, user.passwordSalt],
    );

    await this.dataSource.query(
      `
            INSERT INTO public."UsersConfirmationEmail"(
                "UserId", "IsConfirmed")
            VALUES ($1, $2);
        `,
      [user.id, true],
    );

    return true;
  }

  async createUserForRegistration(user: CreateUserForRegistrationSqlModel) {
    const { login, email, passwordHash, passwordSalt, confirmationCode } = user;

    const createdUser = await this.dataSource.query(
      `
        INSERT INTO public."Users"(
            "Login", "Email")
        VALUES ($1, $2) RETURNING "Id";
        `,
      [login, email],
    );

    const userId = createdUser[0].Id;

    await this.dataSource.query(
      `
        INSERT INTO public."UsersPassword"(
            "UserId", "PasswordHash", "PasswordSalt")
            VALUES ($1, $2, $3);
        `,
      [userId, passwordHash, passwordSalt],
    );

    await this.dataSource.query(
      `
        INSERT INTO public."UsersConfirmationEmail"(
            "UserId", "IsConfirmed", "Code")
        VALUES ($1, $2, $3);
        `,
      [userId, false, confirmationCode],
    );

    return true;
  }

  async createBanUserByIdForSa(
    banDto: UpdateBannedUserForSqlModel,
  ): Promise<boolean> {
    const { userId, isBanned, banReason } = banDto;

    await this.dataSource.query(
      `
            INSERT INTO public."UsersBannedSa"(
                "UserId", "BanReason", "IsBanned")
            VALUES ($1, $2, $3);
        `,
      [userId, banReason, isBanned],
    );

    return true;
  }

  async updateBanUserByIdForSa(banDto: UpdateBannedUserForSqlModel) {
    const { userId, isBanned, banReason } = banDto;

    await this.dataSource.query(
      `
        UPDATE public."UsersBannedSa"
	        SET "BanDate"= now(), "BanReason"= $3, "IsBanned"= $2
	    WHERE "UserId" = $1;
        `,
      [userId, isBanned, banReason],
    );

    return true;
  }

  async updateUnbanUserByIdForSa(userId: string) {
    await this.dataSource.query(
      `
        UPDATE public."UsersBannedSa"
	        SET "BanDate"= null, "BanReason"= null, "IsBanned"= false
	    WHERE "UserId" = $1;
        `,
      [userId],
    );

    return true;
  }

  async deleteUser(userId: string) {
    await this.dataSource.query(
      `
            DELETE FROM public."Users"
	        WHERE "Id" = $1;
        `,
      [userId],
    );

    return true;
  }

  async updateConfirmationEmail(isConfirmed: boolean, userId: string) {
    await this.dataSource.query(
      `
            UPDATE public."UsersConfirmationEmail"
            SET "IsConfirmed"=$1
            WHERE "UserId" = $2;
        `,
      [isConfirmed, userId],
    );

    return true;
  }

  async updateConfirmationCode(userId: string, code: string) {
    await this.dataSource.query(
      `
            UPDATE public."UsersConfirmationEmail"
	        SET "Code"= $2
	        WHERE "UserId" = $1;
        `,
      [userId, code],
    );
  }

  async deleteAllData() {
    await this.dataSource.query(`
            DELETE FROM public."Users";
        `);
  }
}
