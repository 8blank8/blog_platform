import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { BlogCreateType } from "./types/blog.create.type";
import { BlogService } from "./blog.service";
import { BlogQueryRepository } from "./blog.query.repository";
import { BlogUpdateType } from "./types/blog.update.type";



@Controller("blogs")
export class BlogController {
    constructor(
        private readonly blogQueryRepository: BlogQueryRepository,
        private readonly blogService: BlogService
    ) { }

    @Get()
    getBlogs() {
        return this.blogQueryRepository.findAllBlogs()
    }

    @Get('/:id')
    getBlog(@Param('id') id: string) {
        return this.blogQueryRepository.findBlogById(id)
    }

    @Post()
    createBlog(@Body() blog: BlogCreateType) {
        return this.blogService.createBlog(blog)
    }

    @Put()
    updateBlog(
        @Param('id') id: string,
        @Body() updateData: BlogUpdateType
    ) {
        return this.blogService.updateBlog(updateData)
    }

}