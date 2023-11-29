import { BlogQueryRepositoryTypeorm } from "@blog/repository/typeorm/blog.query.repository.typeorm";
import { BlogRepositoryTypeorm } from "@blog/repository/typeorm/blog.repository.typeorm";
import { CommandHandler } from "@nestjs/cqrs";
import { UserQueryRepositoryTypeorm } from "@user/repository/typeorm/user.query.repository.typeorm";


export class DeleteSubscriptionBlogCommand {
    constructor(
        public userId: string,
        public blogId: string
    ) { }
}

@CommandHandler(DeleteSubscriptionBlogCommand)
export class DeleteSubscriptionBlogUseCase {
    constructor(
        private userQueryRepository: UserQueryRepositoryTypeorm,
        private blogQueryRepository: BlogQueryRepositoryTypeorm,
        private blogRepository: BlogRepositoryTypeorm
    ) { }

    async execute(command: DeleteSubscriptionBlogCommand): Promise<boolean> {

        const { userId, blogId } = command

        // const user = await this.userQueryRepository.findUserByIdForSa(userId)
        const blog = await this.blogQueryRepository.findFullBlogById(blogId)
        const subscription = await this.blogQueryRepository.findOneSubscriptionByUserId(blogId, userId)
        if (!blog || !subscription) return false
        if (subscription.currentUserSubscriptionStatus === 'Unsubscribed') return false

        blog.subscribersCount -= 1
        await this.blogRepository.saveBlog(blog)

        subscription.currentUserSubscriptionStatus = 'Unsubscribed'
        await this.blogRepository.saveSubscription(subscription)
        // await this.blogRepository.deleteSubscription(user.id, blog.id)

        return true
    }
}