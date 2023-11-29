import { SortOrder } from '../constants/sort.order';
import {
  mockBlogModel,
  mockCommentModel,
  mockPostModel,
  mockUserModel,
} from '../constants/blanks';
import { UserViewType } from './users.types';
import { BlogViewType } from './blogs.types';
import { CommentViewType } from './comments.types';
import { PostType } from './posts.types';

export enum likeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type SortConditionsType = {
  pageNumber: string;
  pageSize: string;
  sortBy:
    | keyof BlogViewType
    | keyof PostType
    | keyof UserViewType
    | keyof CommentViewType;
  model:
    | typeof mockBlogModel
    | typeof mockPostModel
    | typeof mockUserModel
    | typeof mockCommentModel;
  sortDirection: SortOrder.asc | SortOrder.desc;
};
