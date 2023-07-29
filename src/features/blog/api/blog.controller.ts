import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { BlogCreateType } from "../models/blog.create.type";
import { BlogService } from "../application/blog.service";
import { BlogQueryRepository } from "../infrastructure/blog.query.repository";
import { BlogUpdateType } from "../models/blog.update.type";
import { BlogQueryParamType } from "../models/blog.query.param.type";
import { PostCreateType } from "src/features/post/models/post.create.type";
import { PostService } from "src/features/post/application/post.service";
import { PostQueryRepository } from "src/features/post/infrastructure/post.query.repository";
import { PostQueryParamType } from "src/features/post/models/post.query.param.type";



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

    @Post()
    async createBlog(@Body() blog: BlogCreateType) {
        const blogId: string = await this.blogService.createBlog(blog)
        return this.blogQueryRepository.findBlogById(blogId)
    }

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
        @Query() queryParam: PostQueryParamType
    ) {
        const blog = await this.blogQueryRepository.findBlogById(id)
        if (!blog) return res.sendStatus(404)

        const posts = await this.postQueryRepository.findPosts(queryParam, id)

        return res.status(200).send(posts)
    }


    @Post('/:id/posts')
    async createPostByBlogId(
        @Param('id') id: string,
        @Body() inputData: PostCreateType,
        @Res() res: Response
    ) {
        inputData.blogId = id
        const postId = await this.postService.createPost(inputData)
        if (!postId) return res.sendStatus(404)

        const post = await this.postQueryRepository.findPost(postId)
        return res.status(201).send(post)
    }

}