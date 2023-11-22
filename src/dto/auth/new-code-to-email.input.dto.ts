import { IsEmail } from 'class-validator';

export class NewCodeToEmailInputDto {
  @IsEmail()
  email: string;
}
