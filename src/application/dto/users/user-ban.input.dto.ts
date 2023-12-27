import { IsBoolean, MinLength } from 'class-validator';

export class UserBanDto {
  @IsBoolean()
  isBanned: boolean;

  @MinLength(20)
  banReason: string;
}
