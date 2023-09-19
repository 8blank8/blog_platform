import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostComments } from "../../domain/typeorm/comment.entitty";
import { Repository } from "typeorm";


@Injectable()
export class CommentRepositoryTypeorm {
    constructor(@InjectRepository(PostComments) private commentRepository: Repository<PostComments>) { }

    async saveComment(comment: PostComments) {
        return this.commentRepository.save(comment)
    }
}
