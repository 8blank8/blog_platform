import { Injectable } from "@nestjs/common";
import { BlogCreateType } from "../models/blog.create.type";
import { BlogRepository } from "../infrastructure/blog.repository";
import { BlogUpdateType } from "../models/blog.update.type";
import { BlogQueryRepository } from "../infrastructure/blog.query.repository";



@Injectable()
export class BlogService {
    constructor(
        private readonly blogRepository: BlogRepository,
        private readonly blogQueryRepository: BlogQueryRepository
    ) { }

    async createBlog(blog: BlogCreateType): Promise<string> {
        const newBlog = await this.blogRepository.createBlog(blog)
        newBlog.addId()
        newBlog.addCreatedAt()

        await this.blogRepository.save(newBlog)
        return newBlog.id
    }

    async updateBlog(updateData: BlogUpdateType, id: string) {
        const blog = await this.blogQueryRepository.findBlogDocumentById(id)
        if (!blog) return false

        blog.updateBlog(updateData)

        return this.blogRepository.save(blog)
    }

    async deleteBlog(id: string): Promise<boolean> {
        const blog = await this.blogQueryRepository.findBlogDocumentById(id)
        if (!blog) return false

        const isDelete = await this.blogRepository.deleteBlog(blog.id)
        if (!isDelete) return false

        return true
    }
}