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
import { JwtAuthGuard } from "src/features/auth/guards/jwt.guard";
import { PostCreateByIdType } from "../models/post.create.by.id.type";



@Controller("blogs")
export class BlogController {
    constructor(
        private readonly blogQueryRepository: BlogQueryRepository,
        private readonly blogService: BlogService,
        private readonly postService: PostService,
        private readonly postQueryRepository: PostQueryRepository
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
        if (!blog) return res.sendStatus(404)

        return res.send(blog)
    }

    // @UseGuards(JwtAuthGuard)
    @Post()
    async createBlog(@Body() blog: BlogCreateType) {
        const blogId: string = await this.blogService.createBlog(blog)
        return this.blogQueryRepository.findBlogById(blogId)
    }

    // @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async updateBlog(
        @Param('id') id: string,
        @Body() updateData: BlogUpdateType,
        @Res() res: Response
    ) {
        const isUpdate = await this.blogService.updateBlog(updateData, id)
        if (!isUpdate) return res.sendStatus(404)

        return res.sendStatus(204)
    }

    // @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async deleteBlog(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const isDelete = await this.blogService.deleteBlog(id)
        if (!isDelete) return res.sendStatus(404)

        return res.sendStatus(204)
    }

    @Get('/:id/posts')
    async getPostByBlogId(
        @Param('id') id: string,
        @Res() res: Response,
        @Query() queryParam: PostQueryParamType,
        @Request() req
    ) {
        const blog = await this.blogQueryRepository.findBlogById(id)
        if (!blog) return res.sendStatus(404)

        const posts = await this.postQueryRepository.findPosts(queryParam, req.user.userId, id)

        return res.status(200).send(posts)
    }


    @Post('/:id/posts')
    async createPostByBlogId(
        @Param('id') id: string,
        @Body() inputData: PostCreateByIdType,
        @Res() res: Response
    ) {
        const postId = await this.postService.createPostByIdBlog(inputData, id)
        if (!postId) return res.sendStatus(404)

        const post = await this.postQueryRepository.findPost(postId)
        return res.status(201).send(post)
    }

}