import { Injectable } from "@nestjs/common";
import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
// import { UserQueryRepository } from '/features/user/infrastructure/user.query.repository";
import { UserQueryRepositorySql } from "../../features/user/infrastructure/sql/user.query.repository.sql";
import { UserQueryRepositoryTypeorm } from "../../features/user/infrastructure/typeorm/user.query.repository.typeorm";


@ValidatorConstraint({ name: 'UserExistLogin', async: true })
@Injectable()
export class UserExistLogin implements ValidatorConstraintInterface {
    constructor(
        // private readonly userQueryRepository: UserQueryRepository
        // private userQueryRepositorySql: UserQueryRepositorySql
        private userQueryRepository: UserQueryRepositoryTypeorm
    ) { }

    async validate(login: string) {
        try {
            const isLogin = await this.userQueryRepository.findUserByLoginOrEmail(login);
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