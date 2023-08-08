import { Injectable } from "@nestjs/common";
import { ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";


@ValidatorConstraint({ name: 'LikeStatus' })
@Injectable()
export class LikeStatus implements ValidatorConstraintInterface {
    async validate(likeStatus: string) {
        try {
            switch (likeStatus) {
                case 'Like':
                    return true
                case 'None':
                    return true
                case 'Dislike':
                    return true
                default:
                    return false
            }
        } catch (e) {
            return false;
        }

        return true;
    }

    defaultMessage() {
        return `should be not blank`;
    }
}