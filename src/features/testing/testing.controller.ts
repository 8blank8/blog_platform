import { Controller, Delete, Res } from "@nestjs/common";
import { Response } from "express";
import { BlogRepository } from "src/features/blog/infrastructure/blog.repository";
import { PostRepository } from "src/features/post/infrastructure/post.repository";
import { UserRepository } from "src/features/user/infrastructure/user.repository";
import { CommentRepository } from "../comment/infrastructure/comment.repository";
import { STATUS_CODE } from "src/entity/enum/status.code";


@Controller('/testing')
export class TestingController {
    constructor(
        private readonly blogRepository: BlogRepository,
        private readonly postRepository: PostRepository,
        private readonly userRepository: UserRepository,
        private readonly commentsRepository: CommentRepository
    ) { }

    @Delete('/all-data')
    async deleteAllData(
        @Res() res: Response
    ) {
        await this.postRepository.deleteAllData()
        await this.blogRepository.deleteAllData()
        await this.userRepository.deleteAllData()
        await this.commentsRepository.deleteAllComments()
        await this.commentsRepository.deleteAllCommentsLike()
        await this.postRepository.deleteAllLikes()

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }
}