import { SortOrder } from '../../../constants/sort.order';
import { UserViewType } from '../../../types/users.types';

export class BanUsersQueryDto {
  searchLoginTerm: string;
  sortBy: keyof UserViewType;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
