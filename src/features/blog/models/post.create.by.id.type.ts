import { IsString, Length, IsNotEmpty, Validate } from 'class-validator';

import { IsNotBlank } from '../../../utils/custom-validation/is.not.blank';

export class PostCreateByIdType {
  @IsNotEmpty()
  @IsString()
  @Validate(IsNotBlank)
  @Length(0, 30)
  title: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsNotBlank)
  @Length(0, 100)
  shortDescription: string;

  @IsNotEmpty()
  @IsString()
  @Validate(IsNotBlank)
  @Length(0, 1000)
  content: string;
}
