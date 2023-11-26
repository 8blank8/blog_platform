import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Posts } from '@post/domain/typeorm/post.entity';
import { PostImage } from '@post/domain/typeorm/post.image.entity';
import { PostLikes } from '@post/domain/typeorm/post.like.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostRepositoryTypeorm {
  constructor(
    @InjectRepository(Posts) private postRepository: Repository<Posts>,
    @InjectRepository(PostLikes)
    private postLikesRepository: Repository<PostLikes>,
    @InjectRepository(PostImage) private postImageRepository: Repository<PostImage>,
  ) { }

  async savePost(post: Posts) {
    return this.postRepository.save(post);
  }

  async deletePostById(postId: string) {
    return this.postRepository.delete({ id: postId });
  }

  async savePostLike(postLike: PostLikes) {
    return this.postLikesRepository.save(postLike);
  }

  async savePostImage(image: PostImage) {
    return this.postImageRepository.save(image)
  }
}
