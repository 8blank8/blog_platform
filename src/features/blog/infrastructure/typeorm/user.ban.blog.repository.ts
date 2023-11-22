import { BlogBanUser } from "@blog/domain/typeorm/blog.ban.user.entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";


@Injectable()
export class UserBlogBanRepositoryTypeorm {
    constructor(@InjectRepository(BlogBanUser) private blogBanRepository: Repository<BlogBanUser>) { }

    async saveBlogBan(blogBan: BlogBanUser) {
        this.blogBanRepository.save(blogBan)
    }
}