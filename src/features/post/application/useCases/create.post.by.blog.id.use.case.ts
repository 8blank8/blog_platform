import { CommandHandler } from "@nestjs/cqrs";
// import { PostRepository } from "../../infrastructure/mongo/post.repository";
// import { BlogQueryRepository } from "src/features/blog/infrastructure/mongo/blog.query.repository";
import { PostCreateByIdType } from "../../../../features/blog/models/post.create.by.id.type";
// import { UserQueryRepository } from "src/features/user/infrastructure/user.query.repository";
// import { ForbiddenException } from "@nestjs/common";
import { UserQueryRepositorySql } from "../../../user/infrastructure/sql/user.query.repository.sql";
import { BlogQueryRepositorySql } from "../../../../features/blog/infrastructure/sql/blog.query.repository.sql";
import { PostCreateSqlModel } from "../../infrastructure/sql/models/post.create.sql.model";
import { PostRepositorySql } from "../../infrastructure/sql/post.repository.sql";
import { PostRepositoryTypeorm } from "../../infrastructure/typeorm/post.repository.typeorm";
import { BlogQueryRepositoryTypeorm } from "../../../../features/blog/infrastructure/typeorm/blog.query.repository.typeorm";
import { UserQueryRepositoryTypeorm } from "../../../../features/user/infrastructure/typeorm/user.query.repository.typeorm";
import { Posts } from "../../domain/typeorm/post.entity";


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
        private postRepository: PostRepositoryTypeorm,
        private blogQueryRepository: BlogQueryRepositoryTypeorm,
        // private userQueryRepository: UserQueryRepositoryTypeorm
    ) { }

    async execute(command: CreatePostByBlogIdCommand) {

        const { inputPostData, blogId } = command

        // const user = await this.userQueryRepositorySql.findUser(userId)
        // if (!user) return null

        const blog = await this.blogQueryRepository.findBlogViewById(blogId)
        if (!blog) return null

        const post = new Posts()
        post.content = inputPostData.content
        post.shortDescription = inputPostData.shortDescription
        post.title = inputPostData.title
        post.blog = blog

        await this.postRepository.savePost(post)


        // if (user.id !== blog.userId) throw new ForbiddenException()

        // const post: PostCreateSqlModel = {
        //     ...inputPostData,
        //     blogId: blogId,
        //     // userId: userId
        // }

        // const postId = await this.postRepositorySql.createPost(post)
        // newPost.addId()
        // newPost.addBlogName(blog.name)
        // newPost.addCreatedAt()
        // newPost.setUserId(blog.userId)

        // await this.postRepository.savePost(newPost)

        return post.id
    }
}
