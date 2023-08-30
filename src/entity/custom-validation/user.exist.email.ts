import { Injectable } from "@nestjs/common";
import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { UserQueryRepositorySql } from "src/features/user/infrastructure/user.query.repository.sql";


@ValidatorConstraint({ name: 'UserExistEmail', async: true })
@Injectable()
export class UserExistEmail implements ValidatorConstraintInterface {
    constructor(
        // private usersQueryRepository: UserQueryRepository
        private userQueryRepositorySql: UserQueryRepositorySql
    ) { }

    async validate(email: string) {
        try {
            const isEmail = await this.userQueryRepositorySql.findUserByLoginOrEmail(email);
            if (isEmail) return false
        } catch (e) {
            return false;
        }

        return true;
    }

    defaultMessage() {
        return `Email doesn't exist`;
    }
}