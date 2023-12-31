import { IsString, Length } from 'class-validator';
import { IsNotEmptyString } from '../../../utils/decorators/check-empty-string.decorator';

export class CommentInputDto {
  @IsString()
  @IsNotEmptyString()
  @Length(20, 300)
  content: string;
}
