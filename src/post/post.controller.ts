import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from "@nestjs/common";
import { PostQueryRepository } from "./post.query.repository";
import { PostCreateType } from "./types/post.create.type";
import { Response } from "express";
import { PostService } from "./post.service";
import { PostQueryParamType } from "./types/post.query.param.type";
import { PostUpdateType } from "./types/post.update.type";


@Controller('posts')
export class PostControler {

    constructor(
        private readonly postQueryRepository: PostQueryRepository,
        private readonly postService: PostService
    ) { }

    @Get()
    async getPosts(
        @Query() queryParam: PostQueryParamType
    ) {
        return this.postQueryRepository.findAllPosts(queryParam)
    }

    @Get('/:id')
    async getPost(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const post = await this.postQueryRepository.findPost(id)
        if (!post) return res.sendStatus(404)

        return res.status(200).send(post)
    }

    @Post()
    async createPost(
        @Body() inputPostData: PostCreateType,
        @Res() res: Response
    ) {
        const isCreate = await this.postService.createPost(inputPostData)
        if (!isCreate) return res.sendStatus(400)

        return res.sendStatus(201)
    }

    @Put('/:id')
    async updatePost(
        @Param('id') id: string,
        @Body() inputData: PostUpdateType,
        @Res() res: Response
    ) {
        const isUpdate = await this.postService.updatePost(id, inputData)
        if (!isUpdate) return res.sendStatus(404)

        return res.sendStatus(204)
    }

    @Delete('/:id')
    async deletePost(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const isDelete = await this.postService.deletePost(id)
        if (!isDelete) return res.sendStatus(404)

        return res.sendStatus(204)
    }

}