import { SortOrder } from '../../../constants/sort.order';
import { UserViewType } from '../../../types/users.types';
import { BanStatuses } from '../../../constants/ban-statuses';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class UsersQueryDto {
  searchLoginTerm: string;
  searchEmailTerm: string;
  sortBy: keyof UserViewType;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value !== BanStatuses.notBanned && value !== BanStatuses.banned) {
      return undefined;
    }

    if (value === BanStatuses.banned) {
      return true;
    }
    if (value === BanStatuses.notBanned) {
      return false;
    }
  })
  banStatus: keyof typeof BanStatuses;
}
