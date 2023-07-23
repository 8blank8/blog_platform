import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { BlogCreateType } from "./types/blog.create.type";
import { BlogService } from "./blog.service";
import { BlogQueryRepository } from "./blog.query.repository";
import { BlogUpdateType } from "./types/blog.update.type";
import { BlogQueryParamType } from "./types/blog.query.param.type";
import { PostCreateType } from "src/post/types/post.create.type";
import { PostService } from "src/post/post.service";



@Controller("blogs")
export class BlogController {
    constructor(
        private readonly blogQueryRepository: BlogQueryRepository,
        private readonly blogService: BlogService,
        private readonly postService: PostService
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
        return this.blogService.createBlog(blog)
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

    @Post('/:id/posts')
    async createPostByBlogId(
        @Param('id') id: string,
        @Body() inputData: PostCreateType,
        @Res() res: Response
    ) {
        // разобраться с типизацией создания поста через блог
        // можно попробовать сделать блогайди необязательным значением
        // тогда придется переделать сервис создания поста 

        // в другом случае можно сделать отдельный метод в сервисе блога для создания поста
        // но тогда при изменении логики в создании поста придется менять и логику в сервисе блога 
        // нужно постараться найти компромисс
        const isCreated = await this.postService.createPost(inputData)
    }

}