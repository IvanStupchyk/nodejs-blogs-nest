import { SortOrder } from '../../../constants/sort.order';
import { CommentViewModel } from './comment-view.model';

export class GetSortedCommentsModel {
  searchNameTerm: string;
  sortBy: keyof CommentViewModel;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
