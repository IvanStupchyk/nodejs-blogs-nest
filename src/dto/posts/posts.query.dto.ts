import { SortOrder } from '../../constants/sort.order';
import { PostModel } from '../../models/posts/Post.model';

export class PostsQueryDto {
  sortBy: keyof PostModel;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
