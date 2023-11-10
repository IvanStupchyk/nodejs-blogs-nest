import { IsString, Length, Matches } from 'class-validator';
import { IsNotEmptyString } from '../../../utils/validators/check-empty-string.decorator';

export class BlogDto {
  @Length(1, 15)
  @IsString()
  @IsNotEmptyString()
  name: string;

  @Length(1, 500)
  @IsString()
  @IsNotEmptyString()
  description: string;

  @Length(0, 100)
  @IsString()
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}
