import { IsString, Length } from 'class-validator';
import { IsNotEmptyString } from '../../../utils/decorators/check-empty-string.decorator';
import { isBlogExist } from '../../../utils/decorators/existing-blog.decorator';

export class PostInputDto {
  @Length(1, 30)
  @IsString()
  @IsNotEmptyString()
  title: string;

  @Length(1, 100)
  @IsString()
  @IsNotEmptyString()
  shortDescription: string;

  @Length(1, 1000)
  @IsString()
  @IsNotEmptyString()
  content: string;

  @isBlogExist({
    message: 'such blog should exist',
  })
  blogId: string;
}
