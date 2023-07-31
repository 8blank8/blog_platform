import { Injectable } from "@nestjs/common";
import { UserRepository } from "../infrastructure/user.repository";
import { UserCreateType } from "../models/user.create.type";
import { UserQueryRepository } from "../infrastructure/user.query.repository";
import { EmailManager } from "src/managers/email.manager";
import { v4 as uuidv4 } from 'uuid'
import { ConfirmationCodeType } from "src/features/auth/models/confirmation.code.type";
import { EmailType } from "src/features/auth/models/email.type";


@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly userQueryRepository: UserQueryRepository,
        private readonly emailManager: EmailManager
    ) { }

    async createUser(user: UserCreateType): Promise<string> {
        const newUser = await this.userRepository.createUser(user)
        newUser.addId()
        newUser.addCreatedAt()
        await newUser.setPassWordHash(user.password)

        const confirmationCode = uuidv4()
        newUser.addConfirmationCode(confirmationCode)
        newUser.confirmationEmail()

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

        const confirmationCode: string = uuidv4()
        newUser.addConfirmationCode(confirmationCode)
        await this.emailManager.sendEmailConfirmationMessage(newUser.email, confirmationCode)

        await this.userRepository.save(newUser)
        return true
    }

    async confirmationEmail(code: ConfirmationCodeType): Promise<boolean> {
        const user = await this.userQueryRepository.findUserByConfirmationCode(code.code)
        if (!user) return false

        user.confirmationEmail()
        await this.userRepository.save(user)
        return true
    }

    async confirmationCodeResending(email: EmailType): Promise<boolean> {
        const user = await this.userQueryRepository.findByEmail(email.email)
        console.log(user)
        if (!user || user.isConfirmed === true) return false

        const confirmationCode = uuidv4()
        user.addConfirmationCode(confirmationCode)
        await this.emailManager.sendEmailConfirmationMessage(user.email, confirmationCode)

        return true
    }

    async deleteUser(id: string) {
        return this.userRepository.deleteUser(id)
    }
}