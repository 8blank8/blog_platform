import { IsNotEmpty, IsString } from "class-validator";

export class AnswerCreateModel {
    @IsNotEmpty()
    @IsString()
    answer: string
}