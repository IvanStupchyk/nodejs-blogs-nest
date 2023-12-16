import { IsString } from 'class-validator';

export class AnswerToQuestionInputDto {
  @IsString()
  answer: string;
}
