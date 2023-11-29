import { SortOrder } from '../../constants/sort.order';
import { BlogViewType } from '../../types/blogs.types';

export class BlogsQueryDto {
  searchNameTerm: string;
  sortBy: keyof BlogViewType;
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
