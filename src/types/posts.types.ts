import { PostViewType } from './post-view.type';

export type PostsType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostViewType>;
};
