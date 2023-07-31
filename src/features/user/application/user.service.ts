import { Injectable } from "@nestjs/common";
import { UserRepository } from "../infrastructure/user.repository";
import { UserCreateType } from "../models/user.create.type";
import { UserQueryRepository } from "../infrastructure/user.query.repository";


@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly userQueryRepository: UserQueryRepository
    ) { }

    async createUser(user: UserCreateType): Promise<string> {
        const newUser = await this.userRepository.createUser(user)
        newUser.addId()
        newUser.addCreatedAt()
        await newUser.setPassWordHash(user.password)
        await this.userRepository.save(newUser)

        return newUser.id
    }

    async registrationUser(user: UserCreateType): Promise<boolean> {
        const isEmail = await this.userQueryRepository.findByLoginOrEmail(user.email)
        const isLogin = await this.userQueryRepository.findByLoginOrEmail(user.login)

        if (isEmail || isLogin) return false

        const newUser = await this.userRepository.createUser(user)
        newUser.addId()
        newUser.addCreatedAt()
        await newUser.setPassWordHash(user.password)

    }

    async deleteUser(id: string) {
        return this.userRepository.deleteUser(id)
    }
}