import { Injectable } from "@nestjs/common";
import { BlogCreateType } from "./types/blog.create.type";
import { BlogRepository } from "./blog.repository";
import { BlogUpdateType } from "./types/blog.update.type";
import { BlogQueryRepository } from "./blog.query.repository";



@Injectable()
export class BlogService {
    constructor(
        private readonly blogRepository: BlogRepository,
        private readonly blogQueryRepository: BlogQueryRepository
    ) { }

    async createBlog(blog: BlogCreateType) {
        const newBlog = await this.blogRepository.createBlog(blog)
        newBlog.addId()
        newBlog.addCreatedAt()

        return this.blogRepository.save(newBlog)
    }

    async updateBlog(updateData: BlogUpdateType, id: string) {
        const blog = await this.blogQueryRepository.findBlogById(id)
        if (!blog) return false

        blog.updateBlog(updateData)

        return this.blogRepository.save(blog)
    }

    async deleteBlog(id: string): Promise<boolean> {
        const blog = await this.blogQueryRepository.findBlogById(id)
        if (!blog) return false

        const isDelete = await this.blogRepository.deleteBlog(blog.id)
        if (!isDelete) return false

        return true
    }
}