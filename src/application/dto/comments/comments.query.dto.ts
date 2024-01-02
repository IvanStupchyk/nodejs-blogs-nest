import { SortOrder } from '../../../constants/sort.order';
import { CommentViewType } from '../../../types/comments.types';

export class CommentsQueryDto {
  sortBy: keyof CommentViewType;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
