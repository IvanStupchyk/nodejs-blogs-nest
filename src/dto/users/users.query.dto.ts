import { SortOrder } from '../../constants/sort.order';
import { UserViewType } from '../../types/user-view.type';

export class UsersQueryDto {
  searchLoginTerm: string;
  searchEmailTerm: string;
  sortBy: keyof UserViewType;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
