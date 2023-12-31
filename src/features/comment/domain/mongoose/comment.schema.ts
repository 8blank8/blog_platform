import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UserDocument } from '@user/domain/mongoose/user.schema';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

class CommentatorInfo {
  @Prop({
    required: true,
  })
  userId: string;

  @Prop({
    required: true,
  })
  userLogin: string;

  @Prop({
    default: false,
  })
  userIsBanned: boolean;
}

@Schema()
export class Comment {
  @Prop({
    required: true,
  })
  id: string;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    required: true,
  })
  commentatorInfo: CommentatorInfo;

  @Prop({
    required: true,
  })
  createdAt: string;

  @Prop({
    required: true,
  })
  postId: string;

  @Prop({
    required: true,
  })
  blogId: string;

  addCreatedAt() {
    this.createdAt = new Date().toISOString();
  }

  addId() {
    this.id = uuidv4();
  }

  addCommentatorInfo(user: UserDocument) {
    this.commentatorInfo = {
      userId: user.id,
      userLogin: user.login,
      userIsBanned: false,
    };
  }

  updateContent(inputData: string) {
    this.content = inputData;
  }

  addPostId(postId: string) {
    this.postId = postId;
  }

  addBlogId(blogId: string) {
    this.blogId = blogId;
  }

  setUserIsBanned(isBanned: boolean) {
    this.commentatorInfo.userIsBanned = isBanned;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
  addCreatedAt: Comment.prototype.addCreatedAt,
  addId: Comment.prototype.addId,
  addCommentatorInfo: Comment.prototype.addCommentatorInfo,
  updateContent: Comment.prototype.updateContent,
  addPostId: Comment.prototype.addPostId,
  setUserIsBanned: Comment.prototype.setUserIsBanned,
  addBlogId: Comment.prototype.addBlogId,
};

export type CommentDocument = HydratedDocument<Comment>;
