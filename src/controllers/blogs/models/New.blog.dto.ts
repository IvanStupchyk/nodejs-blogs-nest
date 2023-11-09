import { Length, Matches } from 'class-validator';

export class NewBlogDto {
  @Length(1, 15)
  name: string;

  @Length(1, 500)
  description: string;

  @Length(0, 500)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}
