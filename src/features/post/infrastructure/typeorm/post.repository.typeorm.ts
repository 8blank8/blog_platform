import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Posts } from "../../domain/typeorm/post.entity";
import { Repository } from "typeorm";


@Injectable()
export class PostRepositoryTypeorm {
    constructor(@InjectRepository(Posts) private postRepository: Repository<Posts>) { }

    async savePost(post: Posts) {
        return this.postRepository.save(post)
    }

    async deletePostById(postId: string) {
        return this.postRepository.delete({ id: postId })
    }
}