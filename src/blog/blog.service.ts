import { Injectable } from "@nestjs/common";
import { BlogCreateType } from "./types/blog.create.type";
import { BlogRepository } from "./blog.repository";
import { BlogUpdateType } from "./types/blog.update.type";



@Injectable()
export class BlogService {
    constructor(private readonly blogRepository: BlogRepository) { }

    async createBlog(blog: BlogCreateType) {
        const newBlog = await this.blogRepository.createBlog(blog)
        return newBlog.id
    }

    async updateBlog(updateData: BlogUpdateType) {
        const blog = 
    }
}