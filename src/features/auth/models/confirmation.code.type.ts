import { Injectable } from "@nestjs/common";
import { IsNotEmpty, IsString, Validate, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
// import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { UserQueryRepositorySql } from "../../user/infrastructure/sql/user.query.repository.sql";
import { UserQueryRepositoryTypeorm } from "../../../features/user/infrastructure/typeorm/user.query.repository.typeorm";


@ValidatorConstraint({ name: 'UserIsConfirmed', async: true })
@Injectable()
export class UserIsConfirmed implements ValidatorConstraintInterface {
    constructor(
        // private usersQueryRepository: UserQueryRepository
        private userQueryRepository: UserQueryRepositoryTypeorm
    ) { }

    async validate(code: any) {
        try {
            const user = await this.userQueryRepository.findConfirmationCodeUser(code);

            if (!user || user.isConfirmed) return false
        } catch (e) {
            return false;
        }

        return true;
    }

    defaultMessage() {
        return `User is confirmed`;
    }
}

export class ConfirmationCodeType {
    @IsNotEmpty()
    @IsString()
    @Validate(UserIsConfirmed)
    code: string
}