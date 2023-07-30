import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from "@nestjs/common";
import { PostQueryRepository } from "../infrastructure/post.query.repository";
import { PostCreateType } from "../models/post.create.type";
import { Response } from "express";
import { PostService } from "../application/post.service";
import { PostQueryParamType } from "../models/post.query.param.type";
import { PostUpdateType } from "../models/post.update.type";


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
        return this.postQueryRepository.findPosts(queryParam)
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
        const postId = await this.postService.createPost(inputPostData)
        if (!postId) return res.sendStatus(404)

        const post = await this.postQueryRepository.findPost(postId)
        return res.status(201).send(post)
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