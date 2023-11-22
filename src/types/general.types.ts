import { SortOrder } from '../constants/sort.order';
import {
  mockBlogModel,
  mockCommentModel,
  mockPostModel,
  mockUserModel,
} from '../constants/blanks';
import { BlogModel } from '../models/blogs/Blog.model';
import { UserViewType } from './user-view.type';
import { CommentViewType } from './comment-view.type';
import { PostModel } from '../models/posts/Post.model';

export type BlogsType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogModel>;
};

export type CommentatorInfoType = {
  userId: string;
  userLogin: string;
};

export enum likeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export type CommentLikesViewType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: likeStatus;
};

export type DeviceViewType = {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
};

export type CommentsType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<CommentViewType>;
};

export type APIRequestsCountType = {
  id: string;
  ip: string;
  URL: string;
  date: string;
  createdAt: string;
};

export type SortConditionsType = {
  pageNumber: string;
  pageSize: string;
  sortBy:
    | keyof BlogModel
    | keyof PostModel
    | keyof UserViewType
    | keyof CommentViewType;
  model:
    | typeof mockBlogModel
    | typeof mockPostModel
    | typeof mockUserModel
    | typeof mockCommentModel;
  sortDirection: SortOrder.asc | SortOrder.desc;
};
