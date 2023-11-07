import { PostViewModel } from '../controllers/posts/models/PostViewModel';

export type PostsType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostViewModel>;
};
