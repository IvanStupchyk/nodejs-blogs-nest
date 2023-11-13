import { SortOrder } from '../../../constants/sort.order';
import { ViewUserModel } from './view-user.model';

export class GetSortedUsersModel {
  searchLoginTerm: string;
  searchEmailTerm: string;
  sortBy: keyof ViewUserModel;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
