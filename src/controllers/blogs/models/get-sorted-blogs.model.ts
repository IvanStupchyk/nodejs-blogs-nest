import { BlogType } from '../../../domains/blogs/dto/blog.dto';
import { SortOrder } from '../../../constants/sort.order';

export class GetSortedBlogsModel {
  searchNameTerm: string;
  sortBy: keyof BlogType;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
