import { IsEnum, IsNotEmpty, IsString, Validate } from 'class-validator';
import { LikeStatus } from '../../../utils/custom-validation/like.status';

export class CommentLikeStatusType {
  @IsNotEmpty()
  @IsString()
  // @IsEnum(LIKE_STATUS)
  @Validate(LikeStatus)
  likeStatus: 'Like' | 'None' | 'Dislike';
}
