import { BlogModel } from '../../models/blogs/Blog.model';
import { SortOrder } from '../../constants/sort.order';

export class BlogsQueryDto {
  searchNameTerm: string;
  sortBy: keyof BlogModel;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
