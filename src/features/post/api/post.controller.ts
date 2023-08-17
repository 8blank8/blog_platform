import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, Request, UseGuards } from "@nestjs/common";
import { PostQueryRepository } from "../infrastructure/post.query.repository";
import { PostCreateType } from "../models/post.create.type";
import { Response } from "express";
import { PostService } from "../application/post.service";
import { PostQueryParamType } from "../models/post.query.param.type";
import { PostUpdateType } from "../models/post.update.type";
import { CommentCreateType } from "../../comment/models/comment.create.type";
import { JwtAuthGuard } from "../../auth/guards/jwt.guard";
import { CommentQueryParam } from "../../comment/models/comment.query.param.type";
import { CommentQueryRepository } from "../../comment/infrastructure/comment.query.repository";
import { PostLikeStatusType } from "../models/post.like.status.type";
import { JwtOrNotGuard } from "../../auth/guards/jwt.or.not.guard";
import { BasicAuthGuard } from "src/features/auth/guards/basic.guard";
import { STATUS_CODE } from "src/entity/enum/status.code";


@Controller('posts')
export class PostControler {

    constructor(
        private readonly postQueryRepository: PostQueryRepository,
        private readonly postService: PostService,
        private readonly commentQueryRepository: CommentQueryRepository
    ) { }

    @UseGuards(JwtOrNotGuard)
    @Get()
    async getPosts(
        @Query() queryParam: PostQueryParamType,
        @Request() req
    ) {
        const posts = await this.postQueryRepository.findPosts(queryParam, req.user.userId)
        return posts
    }

    @UseGuards(JwtOrNotGuard)
    @Get('/:id')
    async getPost(
        @Param('id') id: string,
        @Res() res: Response,
        @Request() req
    ) {
        const post = await this.postQueryRepository.findPost(id, req.user.userId)
        if (!post) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.status(STATUS_CODE.OK).send(post)
    }

    @UseGuards(BasicAuthGuard)
    @Post()
    async createPost(
        @Body() inputPostData: PostCreateType,
        @Res() res: Response
    ) {
        const postId = await this.postService.createPost(inputPostData)
        if (!postId) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        const post = await this.postQueryRepository.findPost(postId)
        return res.status(STATUS_CODE.CREATED).send(post)
    }

    @UseGuards(BasicAuthGuard)
    @Put('/:id')
    async updatePost(
        @Param('id') id: string,
        @Body() inputData: PostUpdateType,
        @Res() res: Response
    ) {
        const isUpdate = await this.postService.updatePost(id, inputData)
        if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(BasicAuthGuard)
    @Delete('/:id')
    async deletePost(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const isDelete = await this.postService.deletePost(id)
        if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtAuthGuard)
    @Post('/:id/comments')
    async createCommentForPost(
        @Body() inputData: CommentCreateType,
        @Param('id') id: string,
        @Request() req,
        @Res() res: Response
    ) {
        const newComment = await this.postService.createComment(id, inputData, req.user.userId)
        if (!newComment) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        const comment = await this.commentQueryRepository.findCommentViewById(newComment.id, req.user.userId)

        return res.status(STATUS_CODE.CREATED).send(comment)
    }


    @UseGuards(JwtOrNotGuard)
    @Get('/:id/comments')
    async findCommentsByPostId(
        @Param('id') id: string,
        @Query() queryParam: CommentQueryParam,
        @Request() req,
        @Res() res: Response
    ) {
        const post = await this.postQueryRepository.findPost(id)
        if (!post) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        const comments = await this.commentQueryRepository.findCommentsByPostId(queryParam, id, req.user.userId)
        return res.status(STATUS_CODE.OK).send(comments)
    }

    @UseGuards(JwtAuthGuard)
    @Put('/:id/like-status')
    async updatePostLikeStatus(
        @Param('id') id: string,
        @Body() inputData: PostLikeStatusType,
        @Request() req,
        @Res() res: Response
    ) {
        const isUpdate = await this.postService.updatePostLikeStatus(id, inputData, req.user.userId)
        if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

}