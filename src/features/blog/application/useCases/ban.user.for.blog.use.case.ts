import { CommandHandler } from "@nestjs/cqrs";
import { BanUserForBlogModel } from "../../models/ban.user.for.blog.model";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { BlogQueryRepository } from "../../infrastructure/mongo/blog.query.repository";
import { UserBanBlogRepository } from "../../infrastructure/mongo/user.ban.blog.repository";
import { ForbiddenException } from "@nestjs/common";
import { UserBanBlogQueryRepository } from "../../infrastructure/mongo/user.ban.blog.query.repository";
import { UserQueryRepositorySql } from "src/features/user/infrastructure/user.query.repository.sql";
import { BlogQueryRepositorySql } from "../../infrastructure/sql/blog.query.repository.sql";
import { UserBanBlogQueryRepositorySql } from "../../infrastructure/sql/user.ban.blog.query.repository.sql";
import { UserBanBlogRepositorySql } from "../../infrastructure/sql/user.ban.blog.repository.sql";
import { BannedUserForBlogCreateSqlModel } from "../../infrastructure/sql/models/banned.user.for.blog.create.sql.model";


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
        // private userQueryRepository: UserQueryRepository,
        private userQueryRepositorySql: UserQueryRepositorySql,
        private blogQueryRepositorySql: BlogQueryRepositorySql,
        private userBanBlogQueryRepositorySql: UserBanBlogQueryRepositorySql,
        private userBanBlogRepositorySql: UserBanBlogRepositorySql
        // private blogQueryRepository: BlogQueryRepository,
        // private userBanBlogRepository: UserBanBlogRepository,
        // private userBanBlogQueryRepository: UserBanBlogQueryRepository
    ) { }

    async execute(command: BanUserForBlogCommand): Promise<boolean> {
        const { inputData, bannedUserId, blogUserId } = command

        const user = await this.userQueryRepositorySql.findUser(bannedUserId)
        if (!user) return false

        const blog = await this.blogQueryRepositorySql.findBlogFullById(inputData.blogId)
        if (!blog) return false
        if (blog.userId !== blogUserId) throw new ForbiddenException()

        const bannedUser = await this.userBanBlogQueryRepositorySql.findBannedUser(user.id, blog.id)


        const updateData: BannedUserForBlogCreateSqlModel = {
            userId: user.id,
            blogId: blog.id,
            isBanned: inputData.isBanned,
            banReason: inputData.banReason
        }

        if (!bannedUser) {

            await this.userBanBlogRepositorySql.createBanUserForBlogger(updateData)
            return true
        }

        await this.userBanBlogRepositorySql.updateBanStatus(updateData)

        // if (bannedUser) {
        //     bannedUser.setBanDate()
        //     bannedUser.setBan(inputData.banReason, inputData.isBanned)

        //     await this.userBanBlogRepository.save(bannedUser)
        //     return true
        // }

        // const banUser = await this.userBanBlogRepository.createBannedUser()
        // banUser.setUserId(user.id)
        // banUser.setUserLogin(user.login)
        // banUser.setBan(inputData.banReason, inputData.isBanned)
        // banUser.setBlogId(blog.id)
        // banUser.setBanDate()

        // await this.userBanBlogRepository.save(banUser)

        return true
    }
}
