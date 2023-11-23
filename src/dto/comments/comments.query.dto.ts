import { SortOrder } from '../../constants/sort.order';
import { CommentViewType } from '../../types/comments.types';

export class CommentsQueryDto {
  searchNameTerm: string;
  sortBy: keyof CommentViewType;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
