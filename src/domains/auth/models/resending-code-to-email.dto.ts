import { IsEmail } from 'class-validator';

export class ResendingCodeToEmailDto {
  @IsEmail()
  email: string;
}
