import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, Request, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { BlogCreateType } from "../models/blog.create.type";
import { BlogService } from "../application/blog.service";
import { BlogQueryRepository } from "../infrastructure/blog.query.repository";
import { BlogUpdateType } from "../models/blog.update.type";
import { BlogQueryParamType } from "../models/blog.query.param.type";
import { PostService } from "../../post/application/post.service";
import { PostQueryRepository } from "../../post/infrastructure/post.query.repository";
import { PostQueryParamType } from "../../post/models/post.query.param.type";
import { PostCreateByIdType } from "../models/post.create.by.id.type";
import { BasicAuthGuard } from "src/features/auth/guards/basic.guard";
import { JwtOrNotGuard } from "src/features/auth/guards/jwt.or.not.guard";
import { STATUS_CODE } from "src/entity/enum/status.code";
import { CommandBus } from "@nestjs/cqrs";
import { CreateBlogCommand } from "../application/useCases/create.blog.use.case";
import { UpdateBlogCommand } from "../application/useCases/update.blog.use.case";
import { DeleteBlogCommand } from "../application/useCases/delete.blog.use.case";
import { CreatePostByBlogIdCommand } from "src/features/post/application/useCases/create.post.by.blog.id.use.case";



@Controller("blogs")
export class BlogController {
    constructor(
        private readonly blogQueryRepository: BlogQueryRepository,
        private readonly postQueryRepository: PostQueryRepository,
        private commandBus: CommandBus
    ) { }

    @Get()
    async getBlogs(@Query() queryParam: BlogQueryParamType) {
        return this.blogQueryRepository.findAllBlogs(queryParam)
    }

    @Get('/:id')
    async getBlog(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const blog = await this.blogQueryRepository.findBlogById(id)
        if (!blog) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.send(blog)
    }

    @UseGuards(BasicAuthGuard)
    @Post()
    async createBlog(@Body() blog: BlogCreateType) {
        const blogId: string = await this.commandBus.execute(
            new CreateBlogCommand(blog)
        )

        return this.blogQueryRepository.findBlogById(blogId)
    }

    @UseGuards(BasicAuthGuard)
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

    @UseGuards(BasicAuthGuard)
    @Delete('/:id')
    async deleteBlog(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const isDelete = await this.commandBus.execute(new DeleteBlogCommand(id))
        if (!isDelete) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.sendStatus(STATUS_CODE.NO_CONTENT)
    }

    @UseGuards(JwtOrNotGuard)
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

    @UseGuards(BasicAuthGuard)
    @Post('/:id/posts')
    async createPostByBlogId(
        @Param('id') id: string,
        @Body() inputData: PostCreateByIdType,
        @Res() res: Response
    ) {
        const postId = await this.commandBus.execute(new CreatePostByBlogIdCommand(inputData, id))
        if (!postId) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        const post = await this.postQueryRepository.findPost(postId)
        return res.status(STATUS_CODE.CREATED).send(post)
    }

}