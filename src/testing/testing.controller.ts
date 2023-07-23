import { Controller, Delete, Res } from "@nestjs/common";
import { Response } from "express";
import { BlogRepository } from "src/blog/blog.repository";
import { PostRepository } from "src/post/post.repository";
import { UserRepository } from "src/user/user.repository";


@Controller('/testing')
export class TestingController {
    constructor(
        private readonly blogRepository: BlogRepository,
        private readonly postRepository: PostRepository,
        private readonly userRepository: UserRepository
    ) { }

    @Delete('/all-data')
    async deleteAllData(
        @Res() res: Response
    ) {
        await this.postRepository.deleteAllData()
        await this.blogRepository.deleteAllData()
        await this.userRepository.deleteAllData()

        return res.sendStatus(204)
    }
}