import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, Request, UseGuards } from "@nestjs/common";
import { PostQueryRepository } from "../infrastructure/mongo/post.query.repository";
import { PostCreateType } from "../models/post.create.type";
import { Response } from "express";
import { PostService } from "../application/post.service";
import { PostQueryParamType } from "../models/post.query.param.type";
import { PostUpdateType } from "../models/post.update.type";
import { CommentCreateType } from "../../comment/models/comment.create.type";
import { JwtAuthGuard } from "../../auth/guards/jwt.guard";
import { CommentQueryParam } from "../../comment/models/comment.query.param.type";
import { CommentQueryRepository } from "../../comment/infrastructure/mongo/comment.query.repository";
import { PostLikeStatusType } from "../models/post.like.status.type";
import { JwtOrNotGuard } from "../../auth/guards/jwt.or.not.guard";
import { BasicAuthGuard } from "../../auth/guards/basic.guard";
import { STATUS_CODE } from "../../../entity/enum/status.code";
import { CommandBus } from "@nestjs/cqrs";
import { CreatePostCommand } from "../application/useCases/create.post.use.case";
import { UpdatePostCommand } from "../application/useCases/update.post.use.case";
import { DeletePostCommand } from "../application/useCases/delete.post.use.case";
import { CreateCommentForPostCommand } from "../application/useCases/create.comment.for.post";
import { UpdateLikeStatusForPostCommand } from "../application/useCases/update.like.status.for.post";
import { ConnectionStates } from "mongoose";
import { BlogQueryRepository } from "../../../features/blog/infrastructure/mongo/blog.query.repository";
import { PostQueryRepositorySql } from "../infrastructure/sql/post.query.repository.sql";
import { CommentQueryRepositorySql } from "../../../features/comment/infrastructure/sql/comment.query.repository";


@Controller('posts')
export class PostControler {

    constructor(
        private postQueryRepository: PostQueryRepository,
        private postQueryRepositorySql: PostQueryRepositorySql,
        private commentQueryRepository: CommentQueryRepository,
        private commandBus: CommandBus,
        private blogQueryRepository: BlogQueryRepository,
        private commentQueryRepositorySql: CommentQueryRepositorySql
    ) { }

    @UseGuards(JwtOrNotGuard)
    @Get()
    async getPosts(
        @Query() queryParam: PostQueryParamType,
        @Request() req
    ) {
        const userId = req.user

        const posts = await this.postQueryRepositorySql.findPostsForPublic(queryParam, userId)
        return posts
    }

    @UseGuards(JwtOrNotGuard)
    @Get('/:id')
    async getPost(
        @Param('id') id: string,
        @Res() res: Response,
        @Request() req
    ) {
        const userId = req.user
        const post = await this.postQueryRepositorySql.findPostByIdForPublic(id, userId)
        if (!post) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        // const blogIsBanned = await this.blogQueryRepository.findBannedBlog(post?.blogId)
        // if (blogIsBanned) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.status(STATUS_CODE.OK).send(post)
    }

    @UseGuards(BasicAuthGuard)
    @Post()
    async createPost(
        @Body() inputPostData: PostCreateType,
        @Res() res: Response
    ) {
        const postId = await this.commandBus.execute(new CreatePostCommand(inputPostData))
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
        const isUpdate = await this.commandBus.execute(new UpdatePostCommand(id, inputData))
        if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(BasicAuthGuard)
    @Delete('/:id')
    async deletePost(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const isDelete = await this.commandBus.execute(new DeletePostCommand(id))
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
        const commentId = await this.commandBus.execute(new CreateCommentForPostCommand(id, inputData, req.user))
        if (!commentId) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        const comment = await this.commentQueryRepositorySql.findCommentViewById(commentId)

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
        const post = await this.postQueryRepositorySql.findPostFullById(id)
        if (!post) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        const comments = await this.commentQueryRepositorySql.findCommentsViewByPostId(queryParam, id, req.user)
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
        const isUpdate = await this.commandBus.execute(new UpdateLikeStatusForPostCommand(id, inputData, req.user))
        if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

}