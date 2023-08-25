import { CommandHandler } from "@nestjs/cqrs";
import { BanUserForBlogModel } from "../../models/ban.user.for.blog.model";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { BlogQueryRepository } from "../../infrastructure/blog.query.repository";
import { UserBanBlogRepository } from "../../infrastructure/user.ban.blog.repository";
import { ForbiddenException } from "@nestjs/common";
import { UserBanBlogQueryRepository } from "../../infrastructure/user.ban.blog.query.repository";


export class BanUserForBlogCommand {
    constructor(
        public inputData: BanUserForBlogModel,
        public bannedUserId: string,
        public blogUserId: string
    ) { }
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase {
    constructor(
        private userQueryRepository: UserQueryRepository,
        private blogQueryRepository: BlogQueryRepository,
        private userBanBlogRepository: UserBanBlogRepository,
        private userBanBlogQueryRepository: UserBanBlogQueryRepository
    ) { }

    async execute(command: BanUserForBlogCommand): Promise<boolean> {
        const { inputData, bannedUserId, blogUserId } = command

        const user = await this.userQueryRepository.findUserDocumentById(bannedUserId)
        if (!user) return false

        const blog = await this.blogQueryRepository.findBlogDocumentById(inputData.blogId)
        if (!blog) return false
        if (blog.userId !== blogUserId) throw new ForbiddenException()

        const bannedUser = await this.userBanBlogQueryRepository.findBannedUser(user.id, blog.id)

        if (bannedUser) {
            bannedUser.setBanDate()
            bannedUser.setBan(inputData.banReason, inputData.isBanned)

            await this.userBanBlogRepository.save(bannedUser)
            return true
        }

        const banUser = await this.userBanBlogRepository.createBannedUser()
        banUser.setUserId(user.id)
        banUser.setUserLogin(user.login)
        banUser.setBan(inputData.banReason, inputData.isBanned)
        banUser.setBlogId(blog.id)
        banUser.setBanDate()

        await this.userBanBlogRepository.save(banUser)

        return true
    }
}
