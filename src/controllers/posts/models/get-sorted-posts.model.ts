import { PostType } from '../../../domains/posts/dto/post.dto';
import { SortOrder } from '../../../constants/sort.order';

export type GetSortedPostsModel = {
  sortBy: keyof PostType;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
};
