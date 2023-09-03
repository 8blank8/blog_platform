import { Controller, Delete, Res } from "@nestjs/common";
import { Response } from "express";
import { BlogRepository } from "../blog/infrastructure/mongo/blog.repository";
import { PostRepository } from "../post/infrastructure/mongo/post.repository";
import { UserRepository } from "../user/infrastructure/user.repository";
import { CommentRepository } from "../comment/infrastructure/comment.repository";
import { STATUS_CODE } from "../../entity/enum/status.code";
import { UserRepositorySql } from "../user/infrastructure/user.repository.sql";


@Controller('/testing')
export class TestingController {
    constructor(
        private readonly blogRepository: BlogRepository,
        private readonly postRepository: PostRepository,
        // private readonly userRepository: UserRepository,
        private readonly commentsRepository: CommentRepository,
        private userRepositorySql: UserRepositorySql
    ) { }

    @Delete('/all-data')
    async deleteAllData(
        @Res() res: Response
    ) {
        // await this.postRepository.deleteAllData()
        // await this.blogRepository.deleteAllData()
        // await this.userRepository.deleteAllData()
        // await this.commentsRepository.deleteAllComments()
        // await this.commentsRepository.deleteAllCommentsLike()
        // await this.postRepository.deleteAllLikes()

        await this.userRepositorySql.deleteAllData()

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }
}