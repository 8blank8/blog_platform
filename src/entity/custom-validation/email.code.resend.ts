import { Injectable } from "@nestjs/common";
import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";


@ValidatorConstraint({ name: 'EmailCodeResend', async: true })
@Injectable()
export class EmailCodeResend implements ValidatorConstraintInterface {
    constructor(private usersQueryRepository: UserQueryRepository) { }

    async validate(email: string) {
        try {
            const isEmail = await this.usersQueryRepository.findByLoginOrEmail(email);
            if (!isEmail) return false
        } catch (e) {
            return false;
        }

        return true;
    }

    defaultMessage() {
        return `Email doesn't exist`;
    }
}