import { Body, Controller, Post } from "@nestjs/common";
import { UserCreateType } from "./types/user.create.type";
import { UserService } from "./user.service";
import { UserQueryRepository } from "./user.query.repository";


@Controller('users')
export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly userQueryRepository: UserQueryRepository
    ) { }

    @Post()
    async createUser(
        @Body() inputData: UserCreateType
    ) {
        const userId: string = await this.userService.createUser(inputData)
        const user = await this.userQueryRepository.findUserById(userId)

        return user
    }
}