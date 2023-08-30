import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthQueryRepository } from '../infrastructure/auth.query.repository';
import { AuthRepository } from '../infrastructure/auth.repository';
import { setting_env } from 'src/setting.env';
import { AuthRepositorySql } from '../infrastructure/auth.repository.sql';


@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh-token',

) {
    constructor(
        // private readonly authQueryRepository: AuthQueryRepository,
        // private readonly authRepository: AuthRepository
        private authRepositorySql: AuthRepositorySql
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
                const data = req.cookies.refreshToken
                if (!data) return null

                return data
            }]),
            secretOrKey: setting_env.JWT_SECRET,
            ignoreExpiration: false,
            passReqToCallback: true
        });
    }

    async validate(req: Request, payload: any) {
        if (payload === null) new UnauthorizedException()

        const refreshToken = req.cookies.refreshToken

        const isToken = await this.authRepositorySql.findRefreshTokenInBlackList(refreshToken)
        if (!isToken) {
            return { userId: payload.userId, deviceId: payload.deviceId };
        }

        new UnauthorizedException()
    }
}

