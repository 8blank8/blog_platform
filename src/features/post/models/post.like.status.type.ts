import { IsEnum, IsNotEmpty, IsString, Validate } from "class-validator";
import { LikeStatus } from "../../../entity/custom-validation/like.status";
// import { LIKE_STATUS } from "src/entity/enums/like.status";


export class PostLikeStatusType {
    @IsNotEmpty()
    @IsString()
    @Validate(LikeStatus)
    likeStatus: string
}