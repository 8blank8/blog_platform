import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Post, PostDocument } from '../../domain/mongoose/post.schema';
import { PostQueryParamType } from '../../models/post.query.param.type';
import { QUERY_PARAM } from '../../../../utils/enum/query.param.enum';
import { PostViewType } from '../../models/post.view.type';
import {
  PostLike,
  PostLikeDocument,
} from '../../domain/mongoose/post.like.schema';

@Injectable()
export class PostQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(PostLike.name) private postLikeModel: Model<PostLikeDocument>,
  ) {}

  async findPosts(
    queryParam: PostQueryParamType,
    userId?: string,
    blogId?: string,
  ) {
    const {
      pageNumber = QUERY_PARAM.PAGE_NUMBER,
      pageSize = QUERY_PARAM.PAGE_SIZE,
      sortBy = QUERY_PARAM.SORT_BY,
      sortDirection = QUERY_PARAM.SORT_DIRECTION_DESC,
    } = queryParam;

    const filter: any = { userIsBanned: false };

    if (blogId) {
      filter.blogId = blogId;
    }

    const posts = await this.postModel
      .find(filter)
      .skip((+pageNumber - 1) * +pageSize)
      .limit(+pageSize)
      .sort({ [sortBy]: sortDirection })
      .exec();

    const totalCount = await this.postModel.countDocuments(filter);

    return {
      pagesCount: Math.ceil(totalCount / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: totalCount,
      items: await Promise.all(
        posts.map((item) => this._mapPost(item, userId)),
      ),
    };
  }

  async findPost(id: string, userId?: string): Promise<PostViewType | null> {
    const post = await this.postModel.findOne({ id: id, userIsBanned: false });
    if (!post) return null;

    return await this._mapPost(post, userId);
  }

  async findPostDocumentById(id: string): Promise<PostDocument | null> {
    return this.postModel.findOne({ id: id });
  }

  async findPostLikeStatus(
    id: string,
    userId: string,
  ): Promise<PostLikeDocument | null> {
    const like = await this.postLikeModel.findOne({
      postId: id,
      userId: userId,
    });
    return like;
  }

  async findAllPostsUser(userId): Promise<PostDocument[]> {
    return this.postModel.find({ userId: userId });
  }

  async _mapPost(post: PostDocument, userId?: string): Promise<PostViewType> {
    const likesCount = await this.postLikeModel.countDocuments({
      postId: post.id,
      likeStatus: 'Like',
      userIsBanned: false,
    });
    const dislikesCount = await this.postLikeModel.countDocuments({
      postId: post.id,
      likeStatus: 'Dislike',
      userIsBanned: false,
    });
    const like = await this.postLikeModel.findOne({
      postId: post.id,
      userId: userId,
      userIsBanned: false,
    });
    const newestLikes = await this.postLikeModel
      .find({ postId: post.id, likeStatus: 'Like', userIsBanned: false })
      .sort({ addedAt: 'desc' })
      .limit(3)
      .exec();

    let likeStatus = 'None';

    if (like) {
      likeStatus = like.likeStatus;
    }

    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: likesCount,
        dislikesCount: dislikesCount,
        myStatus: likeStatus,
        newestLikes: newestLikes.map((item) => ({
          addedAt: item.addedAt,
          userId: item.userId,
          login: item.userLogin,
        })),
      },
    };
  }
}
