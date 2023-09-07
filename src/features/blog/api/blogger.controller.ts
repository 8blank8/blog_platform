import { Body, Controller, Get, Param, Post, Query, Res, UseGuards, Request, Put, Req, Delete } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt.guard";
import { BlogCreateType } from "../models/blog.create.type";
import { CommandBus } from "@nestjs/cqrs";
import { CreateBlogCommand } from "../application/useCases/create.blog.use.case";
import { BlogQueryRepository } from "../infrastructure/mongo/blog.query.repository";
import { PostCreateByIdType } from "../models/post.create.by.id.type";
import { CreatePostByBlogIdCommand } from "../../post/application/useCases/create.post.by.blog.id.use.case";
import { STATUS_CODE } from "../../../entity/enum/status.code";
import { Response } from 'express'
import { PostQueryRepository } from "../../post/infrastructure/mongo/post.query.repository";
import { BlogQueryParamType } from "../models/blog.query.param.type";
import { PostQueryParamType } from "../../post/models/post.query.param.type";
import { BlogUpdateType } from "../models/blog.update.type";
import { UpdateBlogCommand } from "../application/useCases/update.blog.use.case";
import { PostUpdateByIdModel } from "../models/post.update.by.id";
import { UpdatePostByBlogIdCommand } from "../application/useCases/update.post.by.blog.id.use.case";
import { DeleteBlogCommand } from "../application/useCases/delete.blog.use.case";
import { DeletePostByBlogIdCommand } from "../application/useCases/delete.post.by.blog.id.use.case";
import { CommentQueryRepository } from "src/features/comment/infrastructure/mongo/comment.query.repository";
import { CommentQueryParam } from "src/features/comment/models/comment.query.param.type";
import { BlogQueryRepositorySql } from "../infrastructure/sql/blog.query.repository.sql";
import { PostQueryRepositorySql } from "src/features/post/infrastructure/sql/post.query.repository.sql";
import { BasicAuthGuard } from "src/features/auth/guards/basic.guard";


@Controller('sa/blogs')
export class BloggerController {
    constructor(
        private commandBus: CommandBus,
        // private blogQueryRepository: BlogQueryRepository,
        private postQueryRepository: PostQueryRepository,
        private commentQueryRepository: CommentQueryRepository,
        private blogQueryRepositorySql: BlogQueryRepositorySql,
        private postQueryRepositorySql: PostQueryRepositorySql
    ) { }

    @UseGuards(BasicAuthGuard)
    @Post()
    async createBlog(
        @Body() blog: BlogCreateType,
    ) {
        const blogId: string = await this.commandBus.execute(
            new CreateBlogCommand(blog)
        )

        return this.blogQueryRepositorySql.findBlogViewById(blogId)
    }

    @UseGuards(BasicAuthGuard)
    @Post('/:id/posts')
    async createPostByBlogId(
        @Param('id') id: string,
        @Body() inputData: PostCreateByIdType,
        @Res() res: Response,
    ) {
        const postId = await this.commandBus.execute(new CreatePostByBlogIdCommand(inputData, id))
        if (!postId) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        const post = await this.postQueryRepositorySql.findPostByIdForPublic(postId)
        return res.status(STATUS_CODE.CREATED).send(post)
    }

    @UseGuards(BasicAuthGuard)
    @Get()
    async getBlogs(
        @Query() queryParam: BlogQueryParamType,
        @Request() req
    ) {
        const userId = req.user
        // return this.blogQueryRepository.findAllBlogs(queryParam, userId)
        return this.blogQueryRepositorySql.findAllBlogsView(queryParam)
    }

    @UseGuards(BasicAuthGuard)
    @Get('/:id/posts')
    async getPostByBlogId(
        @Param('id') id: string,
        @Res() res: Response,
        @Query() queryParam: PostQueryParamType,
        // @Request() req
    ) {
        const blog = await this.blogQueryRepositorySql.findBlogViewById(id)
        if (!blog) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        const posts = await this.postQueryRepositorySql.findPostByBlogForBlogger(id)

        return res.status(STATUS_CODE.OK).send(posts)
    }

    @UseGuards(BasicAuthGuard)
    @Put('/:id')
    async updateBlog(
        @Param('id') id: string,
        @Body() updateData: BlogUpdateType,
        @Res() res: Response,
        // @Request() req
    ) {

        // const userId = req.user

        const isUpdate = await this.commandBus.execute(
            new UpdateBlogCommand(updateData, id)
        )
        if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(BasicAuthGuard)
    @Put('/:blogId/posts/:postId')
    async updatePostById(
        @Param() param,
        @Body() inputData: PostUpdateByIdModel,
        @Res() res: Response,
        @Request() req
    ) {
        // const userId = req.user
        const blogId = param.blogId
        const postId = param.postId

        const isUpdate = await this.commandBus.execute(
            new UpdatePostByBlogIdCommand(postId, blogId, inputData)
        )

        if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(BasicAuthGuard)
    @Delete('/:id')
    async deleteBlog(
        @Param('id') id: string,
        @Res() res: Response,
        // @Request() req
    ) {

        // const userId = req.user

        const isDelete = await this.commandBus.execute(new DeleteBlogCommand(id))
        if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(BasicAuthGuard)
    @Delete(':blogId/posts/:postId')
    async deletePostByBlogId(
        @Param() param,
        // @Request() req,
        @Res() res: Response
    ) {
        // const userId = req.user
        const postId = param.postId
        const blogId = param.blogId

        const isDelete = await this.commandBus.execute(
            new DeletePostByBlogIdCommand(postId, blogId)
        )

        if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtAuthGuard)
    @Get('comments')
    async getAllCommentsPosts(
        @Request() req,
        @Query() queryParam: CommentQueryParam
    ) {
        const userId = req.user
        return this.commentQueryRepository.findAllCommentBlog(userId, queryParam)
    }

}
