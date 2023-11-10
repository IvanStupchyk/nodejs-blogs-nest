import { IsString, Length } from 'class-validator';
import { IsNotEmptyString } from '../../../utils/validators/check-empty-string.decorator';

export class UpdateCommentDto {
  @IsString()
  @IsNotEmptyString()
  @Length(20, 300)
  content: string;
}
