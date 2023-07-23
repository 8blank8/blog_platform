import { Controller, Delete } from "@nestjs/common";
import { BlogRepository } from "src/blog/blog.repository";
import { PostRepository } from "src/post/post.repository";


@Controller('/testing')
export class TestingController {
    constructor(
        private readonly blogRepository: BlogRepository,
        private readonly postRepository: PostRepository
    ){}

    @Delete('/all-data')
    async deleteAllData(){
        await this.postRepository.deleteAllData()
        await this.blogRepository.deleteAllData()
    }
}