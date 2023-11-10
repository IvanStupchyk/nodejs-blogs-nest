import { ObjectId } from 'mongodb';
import { IsMongoId, IsString, Length } from 'class-validator';
import { IsNotEmptyString } from '../../../utils/validators/check-empty-string.validator';

export class NewPostDto {
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

  @IsMongoId()
  blogId: ObjectId;
}
