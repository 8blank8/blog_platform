import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { setting_env } from '../../../setting.env';
// import { UserQueryRepository } from 'src/features/user/infrastructure/user.query.repository';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: setting_env.JWT_SECRET,
        });
    }

    async validate(payload: any) {
        return payload.id;
    }
}