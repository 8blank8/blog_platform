import { Body, Controller, Get, Param, Post, Query, Res, UseGuards, Request, Put, Req, Delete } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt.guard";
import { BlogCreateType } from "../models/blog.create.type";
import { CommandBus } from "@nestjs/cqrs";
import { CreateBlogCommand } from "../application/useCases/create.blog.use.case";
import { BlogQueryRepository } from "../infrastructure/blog.query.repository";
import { PostCreateByIdType } from "../models/post.create.by.id.type";
import { CreatePostByBlogIdCommand } from "../../post/application/useCases/create.post.by.blog.id.use.case";
import { STATUS_CODE } from "../../../entity/enum/status.code";
import { Response } from 'express'
import { PostQueryRepository } from "../../post/infrastructure/post.query.repository";
import { BlogQueryParamType } from "../models/blog.query.param.type";
import { PostQueryParamType } from "../../post/models/post.query.param.type";
import { BlogUpdateType } from "../models/blog.update.type";
import { UpdateBlogCommand } from "../application/useCases/update.blog.use.case";
import { PostUpdateByIdModel } from "../models/post.update.by.id";
import { UpdatePostByBlogIdCommand } from "../application/useCases/update.post.by.blog.id.use.case";
import { DeleteBlogCommand } from "../application/useCases/delete.blog.use.case";
import { DeletePostByBlogIdCommand } from "../application/useCases/delete.post.by.blog.id.use.case";


@Controller('blogger/blogs')
export class BloggerController {
    constructor(
        private commandBus: CommandBus,
        private blogQueryRepository: BlogQueryRepository,
        private postQueryRepository: PostQueryRepository
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createBlog(
        @Body() blog: BlogCreateType,
        @Request() req
    ) {
        const userId = req.user

        const blogId: string = await this.commandBus.execute(
            new CreateBlogCommand(blog, userId)
        )

        return this.blogQueryRepository.findBlogById(blogId)
    }

    @UseGuards(JwtAuthGuard)
    @Post('/:id/posts')
    async createPostByBlogId(
        @Param('id') id: string,
        @Body() inputData: PostCreateByIdType,
        @Res() res: Response,
        @Request() req
    ) {

        const userId = req.user

        const postId = await this.commandBus.execute(new CreatePostByBlogIdCommand(inputData, id, userId))
        if (!postId) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        const post = await this.postQueryRepository.findPost(postId)
        return res.status(STATUS_CODE.CREATED).send(post)
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getBlogs(
        @Query() queryParam: BlogQueryParamType,
        @Request() req
    ) {
        const userId = req.user
        return this.blogQueryRepository.findAllBlogs(queryParam, userId)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:id/posts')
    async getPostByBlogId(
        @Param('id') id: string,
        @Res() res: Response,
        @Query() queryParam: PostQueryParamType,
        @Request() req
    ) {
        const blog = await this.blogQueryRepository.findBlogById(id)
        if (!blog) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        const posts = await this.postQueryRepository.findPosts(queryParam, req.user.userId, id)

        return res.status(STATUS_CODE.OK).send(posts)
    }

    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async updateBlog(
        @Param('id') id: string,
        @Body() updateData: BlogUpdateType,
        @Res() res: Response
    ) {
        const isUpdate = await this.commandBus.execute(
            new UpdateBlogCommand(updateData, id)
        )
        if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtAuthGuard)
    @Put('/:blogId/posts/:postId')
    async updatePostById(
        @Param() param,
        @Body() inputData: PostUpdateByIdModel,
        @Res() res: Response,
        @Request() req
    ) {
        const userId = req.user
        const blogId = param.blogId
        const postId = param.postId

        const isUpdate = await this.commandBus.execute(
            new UpdatePostByBlogIdCommand(userId, postId, blogId, inputData)
        )

        if (!isUpdate) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async deleteBlog(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const isDelete = await this.commandBus.execute(new DeleteBlogCommand(id))
        if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':blogId/posts/:postId')
    async deletePostByBlogId(
        @Param() param,
        @Request() req,
        @Res() res: Response
    ) {
        const userId = req.user
        const postId = param.postId
        const blogId = param.blogId

        const isDelete = await this.commandBus.execute(
            new DeletePostByBlogIdCommand(userId, postId, blogId)
        )

        if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }
}
