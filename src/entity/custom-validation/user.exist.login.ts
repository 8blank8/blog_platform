import { Injectable } from "@nestjs/common";
import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { UserQueryRepositorySql } from "src/features/user/infrastructure/user.query.repository.sql";


@ValidatorConstraint({ name: 'UserExistLogin', async: true })
@Injectable()
export class UserExistLogin implements ValidatorConstraintInterface {
    constructor(
        // private readonly userQueryRepository: UserQueryRepository
        private userQueryRepositorySql: UserQueryRepositorySql
    ) { }

    async validate(login: string) {
        try {
            const isLogin = await this.userQueryRepositorySql.findUserByLoginOrEmail(login);
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