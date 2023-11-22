import { IsString } from 'class-validator';

export class LoginUserInputDto {
  @IsString()
  loginOrEmail: string;

  @IsString()
  password: string;
}
