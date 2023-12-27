import { IsBoolean, MinLength } from 'class-validator';

export class UserBanDto {
  @IsBoolean()
  isBanned: boolean;

  @MinLength(1)
  banReason: string;
}
