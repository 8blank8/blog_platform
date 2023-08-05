import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { LIKE_STATUS } from "src/entity/enums/like.status";


export class PostLikeStatusType {
    @IsNotEmpty()
    @IsString()
    @IsEnum(LIKE_STATUS)
    likeStatus: string
}