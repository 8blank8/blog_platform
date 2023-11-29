import { BlogSubscription } from "@blog/domain/typeorm/blog.subscription";
import { BlogQueryRepositoryTypeorm } from "@blog/repository/typeorm/blog.query.repository.typeorm";
import { BlogRepositoryTypeorm } from "@blog/repository/typeorm/blog.repository.typeorm";
import { CommandHandler } from "@nestjs/cqrs";
import { UserQueryRepositoryTypeorm } from "@user/repository/typeorm/user.query.repository.typeorm";


export class CreateSubscriptionBlogCommand {
    constructor(
        public userId: string,
        public blogId: string
    ) { }
}

@CommandHandler(CreateSubscriptionBlogCommand)
export class CreateSubscriptionBlogUseCase {
    constructor(
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private blogQueryRepository: BlogQueryRepositoryTypeorm,
        private blogRepository: BlogRepositoryTypeorm
    ) { }

    async execute(command: CreateSubscriptionBlogCommand): Promise<boolean> {
        const { userId, blogId } = command

        const user = await this.userQueryRepository.findUserByIdForSa(userId)
        const blog = await this.blogQueryRepository.findFullBlogById(blogId)
        const telegramProfile = await this.userQueryRepository.findTelegramProfileByUserId(userId)
        const prevSubscription = await this.blogQueryRepository.findOneSubscriptionByUserId(blogId, userId)
        if (prevSubscription) return false
        if (!user || !blog) return false

        const subscription = new BlogSubscription()
        subscription.blog = blog
        subscription.user = user
        subscription.currentUserSubscriptionStatus = 'Subscribed'

        if (telegramProfile) {
            subscription.telegramProfile = telegramProfile
        }

        blog.subscribersCount += 1

        await this.blogRepository.saveBlog(blog)
        await this.blogRepository.saveSubscription(subscription)

        return true
    }
}