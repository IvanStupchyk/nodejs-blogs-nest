import { SortOrder } from '../../constants/sort.order';
import { CommentViewType } from '../../types/comment-view.type';

export class CommentsQueryDto {
  searchNameTerm: string;
  sortBy: keyof CommentViewType;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
