import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Blogs } from "../../domain/typeorm/blog.entity";
import { Repository } from "typeorm";


@Injectable()
export class BlogQueryRepositoryTypeorm {
    constructor(@InjectRepository(Blogs) private blogRepository: Repository<Blogs>) { }

    async findBlogViewById(blogId: string): Promise<Blogs | null> {
        return this.blogRepository.createQueryBuilder('b')
            .where('id = :blogId', { blogId })
            .getOne()
    }
}