import { Inject, Injectable } from "@nestjs/common";
import { IsNotEmpty, IsString, Length, Matches, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator"
import { UserQueryRepository } from "../infrastructure/user.query.repository";


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

@ValidatorConstraint({ name: 'UserExistEmail', async: true })
@Injectable()
export class UserExistEmail implements ValidatorConstraintInterface {
    constructor(private usersQueryRepository: UserQueryRepository) { }

    async validate(email: string) {
        try {
            const em = await this.usersQueryRepository.findByLoginOrEmail(email);
            console.log(em)
        } catch (e) {
            return false;
        }

        return true;
    }

    defaultMessage() {
        return `Email doesn't exist`;
    }
}

export class UserCreateType {
    // constructor(private readonly userExistEmail: UserExistEmail){}

    @IsNotEmpty()
    @IsString()
    @Length(3, 10)
    @Matches(/^[a-zA-Z0-9_-]*$/)
    @Validate(UserExistLogin)
    login: string

    @IsNotEmpty()
    @IsString()
    @Length(6, 20)
    password: string

    @IsNotEmpty()
    @IsString()
    @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    @Validate(UserExistEmail)
    email: string
}