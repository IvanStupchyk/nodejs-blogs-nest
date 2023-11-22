import { Length, IsString } from 'class-validator';

export class NewPasswordInputDto {
  @IsString()
  recoveryCode: string;

  @Length(6, 20)
  newPassword: string;
}
