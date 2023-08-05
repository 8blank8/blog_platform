import { IsEnum, IsNotEmpty, IsString } from "class-validator";
// import { LIKE_STATUS } from "src/entity/enums/like.status";

export class CommentLikeStatusType {
    @IsNotEmpty()
    @IsString()
    // @IsEnum(LIKE_STATUS)
    likeStatus: 'Like' | 'None' | 'Dislike'
}