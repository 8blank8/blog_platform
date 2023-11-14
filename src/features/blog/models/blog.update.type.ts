import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  NotContains,
} from 'class-validator';

export class BlogUpdateType {
  @IsNotEmpty()
  @IsString()
  @Length(0, 15)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 500)
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsNotEmpty()
  @IsString()
  @Length(0, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}
