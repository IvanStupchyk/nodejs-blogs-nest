import { ObjectId } from 'mongodb';
import { IsMongoId, Length } from 'class-validator';

export class NewPostDto {
  @Length(1, 30)
  title: string;

  @Length(1, 100)
  shortDescription: string;

  @Length(1, 1000)
  content: string;

  @IsMongoId()
  blogId: ObjectId;
}
