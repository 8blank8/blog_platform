import { Controller, Get, Param, Query, Res, Request, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { BlogQueryRepository } from "../infrastructure/mongo/blog.query.repository";
import { BlogQueryParamType } from "../models/blog.query.param.type";
import { PostQueryRepository } from "../../post/infrastructure/mongo/post.query.repository";
import { PostQueryParamType } from "../../post/models/post.query.param.type";
import { JwtOrNotGuard } from "../../auth/guards/jwt.or.not.guard";
import { STATUS_CODE } from "../../../entity/enum/status.code";
import { BlogQueryRepositorySql } from "../infrastructure/sql/blog.query.repository.sql";
import { PostQueryRepositorySql } from "../../../features/post/infrastructure/sql/post.query.repository.sql";
import { BlogQueryRepositoryTypeorm } from "../infrastructure/typeorm/blog.query.repository.typeorm";
import { BlogQueryParamModel } from "../../../features/sa/infrastructure/models/blog.query.param";
import { PostQueryRepositoryTypeorm } from "src/features/post/infrastructure/typeorm/post.query.repository.typeorm";



@Controller("blogs")
export class BlogController {
    constructor(
        private blogQueryRepository: BlogQueryRepositoryTypeorm,
        private readonly postQueryRepository: PostQueryRepositoryTypeorm,
        private blogQueryRepositorySql: BlogQueryRepositorySql,
        private postQueryRepositorySql: PostQueryRepositorySql
    ) { }

    @Get()
    async getBlogs(@Query() queryParam: BlogQueryParamModel) {
        return this.blogQueryRepository.findAllBlogsView(queryParam)
    }

    @Get('/:id')
    async getBlog(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const blog = await this.blogQueryRepository.findBlogViewById(id)
        if (!blog) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        return res.send(blog)
    }

    @UseGuards(JwtOrNotGuard)
    @Get('/:id/posts')
    async getPostByBlogId(
        @Param('id') id: string,
        @Res() res: Response,
        @Query() queryParam: PostQueryParamType,
        @Request() req
    ) {
        // const blog = await this.blogQueryRepository.findBlogById(id)
        const userId = req.user

        const blog = await this.blogQueryRepository.findBlogViewById(id)
        if (!blog) return res.sendStatus(STATUS_CODE.NOT_FOUND)

        // const posts = await this.postQueryRepository.findPosts(queryParam, req.user, id)
        const posts = await this.postQueryRepository.findPostByBlogForBlogger(id, queryParam)

        return res.status(STATUS_CODE.OK).send(posts)
    }
}