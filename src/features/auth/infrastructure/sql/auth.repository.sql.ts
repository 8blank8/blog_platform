import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { AuthRefershTokenViewSqlModel } from '../models/auth.refresh.token.view.sql.model';

@Injectable()
export class AuthRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async postRefreshTokenInBlackList(refreshToken: string) {
    await this.dataSource.query(
      `
        INSERT INTO public."BlackListRefreshToken"(
            "RefreshToken")
        VALUES ($1);
        `,
      [refreshToken],
    );

    return true;
  }

  async findRefreshTokenInBlackList(
    refreshToken: string,
  ): Promise<AuthRefershTokenViewSqlModel> {
    const token = await this.dataSource.query(
      `
            SELECT "RefreshToken"
	        FROM public."BlackListRefreshToken"
	        WHERE "RefreshToken" = $1;
        `,
      [refreshToken],
    );

    return token.map(this._mapRefershToken)[0];
  }

  _mapRefershToken(token): AuthRefershTokenViewSqlModel {
    return {
      refreshToken: token.RefreshToken,
    };
  }
}
