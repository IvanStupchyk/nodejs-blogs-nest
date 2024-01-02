import { IsBoolean } from 'class-validator';

export class SaUserBanBlogInputDto {
  @IsBoolean()
  isBanned: boolean;
}
