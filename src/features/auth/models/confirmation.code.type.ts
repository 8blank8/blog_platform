import { Injectable } from "@nestjs/common";
import { IsNotEmpty, IsString, Validate, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";


@ValidatorConstraint({ name: 'UserIsConfirmed', async: true })
@Injectable()
export class UserIsConfirmed implements ValidatorConstraintInterface {
    constructor(private usersQueryRepository: UserQueryRepository) { }

    async validate(code: any) {
        try {
            const user = await this.usersQueryRepository.findUserByConfirmationCode(code);
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