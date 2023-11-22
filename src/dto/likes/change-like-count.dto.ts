import { IsString } from 'class-validator';

export class ChangeLikeCountDto {
  @IsString()
  likeStatus: string;
}
