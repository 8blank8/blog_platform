import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';


@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
    Strategy,
    'jwt-refresh-token',
) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => {
                const data = req.cookies.refreshToken
                if (!data) return null
                return data
            }]),
            secretOrKey: '123',
            ignoreExpiration: false
        });
    }

    async validate(payload: any) {
        if (payload === null) new UnauthorizedException()
        return { userId: payload.userId, deviceId: payload.deviceId };
    }
}