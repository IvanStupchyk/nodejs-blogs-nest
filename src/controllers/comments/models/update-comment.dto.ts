import { IsString, Length } from 'class-validator';
import { IsNotEmptyString } from '../../../utils/validators/check-empty-string.validator';

export class UpdateCommentDto {
  @IsString()
  @IsNotEmptyString()
  @Length(20, 300)
  content: string;
}
