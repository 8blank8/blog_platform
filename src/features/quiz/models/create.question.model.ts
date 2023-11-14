import { IsArray, IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateQuestionModel {
  @IsNotEmpty()
  @IsString()
  @Length(10, 500)
  body: string;

  @IsNotEmpty()
  @IsArray()
  correctAnswers: string[];
}
