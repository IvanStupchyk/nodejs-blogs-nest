import { IsBoolean, IsString, MinLength } from 'class-validator';
import { isBlogExist } from '../../../utils/decorators/existing-blog.decorator';

export class UserBanByBloggerInputDto {
  @IsBoolean()
  isBanned: boolean;

  @MinLength(20)
  banReason: string;

  @IsString()
  @isBlogExist({
    message: 'such blog should exist',
  })
  blogId: string;
}
