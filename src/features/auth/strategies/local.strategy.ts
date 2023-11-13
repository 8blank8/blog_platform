import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateUserCommand } from '../application/useCases/validate.user.use.case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(
        private commandBus: CommandBus
    ) {
        super({ usernameField: 'loginOrEmail' });
    }

    async validate(username: string, password: string): Promise<any> {
        const user = await this.commandBus.execute(new ValidateUserCommand(username, password));

        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}