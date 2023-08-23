import { CommandHandler } from "@nestjs/cqrs";
import { BanUserForBlogModel } from "../../models/ban.user.for.blog.model";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { BlogQueryRepository } from "../../infrastructure/blog.query.repository";
import { UserBanBlogRepository } from "../../infrastructure/user.ban.blog.repository";


export class BanUserForBlogCommand {
    constructor(
        public inputData: BanUserForBlogModel,
        public userId: string,
        public blogUserId: string
    ) { }
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase {
    constructor(
        private userQueryRepository: UserQueryRepository,
        private blogQueryRepository: BlogQueryRepository,
        private userBanBlogRepository: UserBanBlogRepository
    ) { }

    async execute(command: BanUserForBlogCommand): Promise<boolean> {
        const { inputData, userId, blogUserId } = command

        const user = await this.userQueryRepository.findUserDocumentById(userId)
        if (!user) return false

        const blog = await this.blogQueryRepository.findBlogDocumentByUserId(blogUserId)
        if (!blog) return false

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
