import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Posts } from '../../domain/typeorm/post.entity';
import { PostLikes } from '../../domain/typeorm/post.like.entity';

@Injectable()
export class PostRepositoryTypeorm {
  constructor(
    @InjectRepository(Posts) private postRepository: Repository<Posts>,
    @InjectRepository(PostLikes)
    private postLikesRepository: Repository<PostLikes>,
  ) {}

  async savePost(post: Posts) {
    return this.postRepository.save(post);
  }

  async deletePostById(postId: string) {
    return this.postRepository.delete({ id: postId });
  }

  async savePostLike(postLike: PostLikes) {
    return this.postLikesRepository.save(postLike);
  }
}
