import { Injectable } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { UserCreateType } from "./types/user.create.type";


@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async createUser(user: UserCreateType): Promise<string> {
        const newUser = await this.userRepository.createUser(user)
        newUser.addId()
        newUser.addCreatedAt()
        await newUser.setPassWordHash(user.password)

        await this.userRepository.save(newUser)
        return newUser.id
    }
}