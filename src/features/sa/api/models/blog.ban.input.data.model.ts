import { IsBoolean, IsNotEmpty } from 'class-validator';

export class BlogBanInputDataModel {
  @IsNotEmpty()
  @IsBoolean()
  isBanned: boolean;
}
