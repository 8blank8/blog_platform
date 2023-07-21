import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { PostQueryRepository } from "./post.query.repository";
import { PostCreateType } from "./types/post.create.type";
import { Response } from "express";
import { PostService } from "./post.service";


@Controller('posts')
export class PostControler {

    constructor(
        private readonly postQueryRepository: PostQueryRepository,
        private readonly postService: PostService
    ) { }

    @Get()
    async getPosts() {
        return this.postQueryRepository.findAllPosts()
    }

    @Post()
    async createPost(
        @Body() inputPostData: PostCreateType,
        @Res() res: Response
    ) {
        const isCreate = await this.postService.createPost(inputPostData)
        if (!isCreate) return res.sendStatus(400)

        return res.sendStatus(200)
    }
}