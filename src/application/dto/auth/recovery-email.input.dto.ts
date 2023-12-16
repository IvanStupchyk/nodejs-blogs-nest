import { IsEmail } from 'class-validator';

export class RecoveryEmailInputDto {
  @IsEmail()
  email: string;
}
