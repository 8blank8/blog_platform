import { IsNotEmpty, IsString } from "class-validator";

export class QuizAnswerModel {
    @IsNotEmpty()
    @IsString()
    answer: string
}