import { CommandHandler } from "@nestjs/cqrs";
import { PostRepository } from "../../infrastructure/mongo/post.repository";
import { BlogQueryRepository } from "src/features/blog/infrastructure/mongo/blog.query.repository";
import { PostCreateByIdType } from "src/features/blog/models/post.create.by.id.type";
import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
import { ForbiddenException } from "@nestjs/common";
import { UserQueryRepositorySql } from "src/features/user/infrastructure/user.query.repository.sql";
import { BlogQueryRepositorySql } from "src/features/blog/infrastructure/sql/blog.query.repository.sql";
import { PostCreateSqlModel } from "../../infrastructure/sql/models/post.create.sql.model";
import { PostRepositorySql } from "../../infrastructure/sql/post.repository.sql";


export class CreatePostByBlogIdCommand {
    constructor(
        public inputPostData: PostCreateByIdType,
        public blogId: string,
    ) { }
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase {
    constructor(
        // private postRepository: PostRepository,
        // private blogQueryRepository: BlogQueryRepository,
        // private userQueryRepository: UserQueryRepository
        private postRepositorySql: PostRepositorySql,
        private blogQueryRepositorySql: BlogQueryRepositorySql,
        private userQueryRepositorySql: UserQueryRepositorySql
    ) { }

    async execute(command: CreatePostByBlogIdCommand) {

        const { inputPostData, blogId } = command

        // const user = await this.userQueryRepositorySql.findUser(userId)
        // if (!user) return null

        const blog = await this.blogQueryRepositorySql.findBlogFullById(blogId)
        if (!blog) return null

        // if (user.id !== blog.userId) throw new ForbiddenException()

        const post: PostCreateSqlModel = {
            ...inputPostData,
            blogId: blogId,
            // userId: userId
        }

        const postId = await this.postRepositorySql.createPost(post)
        // newPost.addId()
        // newPost.addBlogName(blog.name)
        // newPost.addCreatedAt()
        // newPost.setUserId(blog.userId)

        // await this.postRepository.savePost(newPost)

        return postId
    }
}
