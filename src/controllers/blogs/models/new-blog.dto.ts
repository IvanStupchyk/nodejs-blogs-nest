import { IsString, Length, Matches } from 'class-validator';

export class NewBlogDto {
  @Length(1, 15)
  @IsString()
  name: string;

  @Length(1, 500)
  @IsString()
  description: string;

  @Length(0, 100)
  @IsString()
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}
