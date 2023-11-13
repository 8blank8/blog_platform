import { IsNotEmpty, IsString, Length, Matches, Validate } from "class-validator"
import { UserExistLogin } from "../../../utils/custom-validation/user.exist.login";
import { UserExistEmail } from "../../../utils/custom-validation/user.exist.email";


export class UserCreateType {

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