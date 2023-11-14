import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostComments } from '../../domain/typeorm/comment.entitty';
import { Repository } from 'typeorm';
import { PostCommentLike } from '../../domain/typeorm/comment.like.entity';

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
