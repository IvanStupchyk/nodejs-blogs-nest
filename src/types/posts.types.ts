import { PostViewModel } from '../controllers/posts/models/post-view.model';

export type PostsType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostViewModel>;
};
