import { Injectable } from "@nestjs/common";
import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
// import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { UserQueryRepositorySql } from "../../features/user/infrastructure/sql/user.query.repository.sql";
import { UserQueryRepositoryTypeorm } from "../../features/user/infrastructure/typeorm/user.query.repository.typeorm";


@ValidatorConstraint({ name: 'EmailCodeResend', async: true })
@Injectable()
export class EmailCodeResend implements ValidatorConstraintInterface {
    constructor(
        // private usersQueryRepository: UserQueryRepository
        private userQueryRepository: UserQueryRepositoryTypeorm
    ) { }

    async validate(email: string) {
        try {
            const user = await this.userQueryRepository.findUserByEmailWithConfirmationEmail(email);

            if (!user || user.confirmationInfo.isConfirmed === true) return false
        } catch (e) {
            return false;
        }

        return true;
    }

    defaultMessage() {
        return `Email doesn't exist`;
    }
}