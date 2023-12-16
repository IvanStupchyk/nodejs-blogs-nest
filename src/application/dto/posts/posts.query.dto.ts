import { SortOrder } from '../../../constants/sort.order';
import { PostType } from '../../../types/posts.types';

export class PostsQueryDto {
  sortBy: keyof PostType;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
