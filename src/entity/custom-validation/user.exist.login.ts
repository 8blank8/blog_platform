import { Injectable } from "@nestjs/common";
import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";


@ValidatorConstraint({ name: 'UserExistLogin', async: true })
@Injectable()
export class UserExistLogin implements ValidatorConstraintInterface {
    constructor(private readonly userQueryRepository: UserQueryRepository) { }

    async validate(login: string) {
        try {
            const isLogin = await this.userQueryRepository.findByLoginOrEmail(login);
            if (isLogin) return false
        } catch (e) {
            return false;
        }

        return true;
    }

    defaultMessage() {
        return `Login doesn't exist`;
    }
}