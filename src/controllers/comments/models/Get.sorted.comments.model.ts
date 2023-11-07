import { SortOrder } from '../../../constants/sort.order';
import { CommentViewModel } from './Comment.view.model';

export type GetSortedCommentsModel = {
  searchNameTerm: string;
  sortBy: keyof CommentViewModel;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
};
