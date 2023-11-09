import { IsEmail } from 'class-validator';

export class RecoveryCodeEmailDto {
  @IsEmail()
  email: string;
}
