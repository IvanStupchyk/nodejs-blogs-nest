import { IsNotEmpty, IsString } from 'class-validator';

export class AnswerToQuestionInputDto {
  @IsNotEmpty()
  @IsString()
  answer: string;
}
