import { IsNotEmpty, IsString, Validate } from 'class-validator';

import { LikeStatus } from '../../../utils/custom-validation/like.status';

export class CommentLikeStatusType {
  @IsNotEmpty()
  @IsString()
  @Validate(LikeStatus)
  likeStatus: 'Like' | 'None' | 'Dislike';
}
