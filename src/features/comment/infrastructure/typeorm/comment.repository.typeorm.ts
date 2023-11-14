import { PostComments } from '@comment/domain/typeorm/comment.entitty';
import { PostCommentLike } from '@comment/domain/typeorm/comment.like.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommentRepositoryTypeorm {
  constructor(
    @InjectRepository(PostComments)
    private commentRepository: Repository<PostComments>,
    @InjectRepository(PostCommentLike)
    private commentLikeRepository: Repository<PostCommentLike>,
  ) {}

  async saveComment(comment: PostComments) {
    return this.commentRepository.save(comment);
  }

  async deleteComementById(commentId: string) {
    return this.commentRepository.delete({ id: commentId });
  }

  async saveCommentLike(commentLike: PostCommentLike) {
    return this.commentLikeRepository.save(commentLike);
  }
}
