import { IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  loginOrEmail: string;

  @IsString()
  password: string;
}
