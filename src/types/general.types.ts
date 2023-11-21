import { SortOrder } from '../constants/sort.order';
import {
  mockBlogModel,
  mockCommentModel,
  mockPostModel,
  mockUserModel,
} from '../constants/blanks';
import { ObjectId } from 'mongodb';
import { BlogModel } from '../domains/blogs/dto/blog.dto';
import { PostType } from '../domains/posts/dto/post.dto';
import { ViewUserModel } from '../controllers/users/models/view-user.model';
import { CommentViewModel } from '../controllers/comments/models/comment-view.model';

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

export type UserCommentLikesType = {
  commentId: ObjectId;
  myStatus: likeStatus;
  createdAt: string;
};

export type InvalidRefreshTokensType = {
  id: ObjectId;
  refreshToken: string;
  createdAt: string;
};

export type CommentLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
};

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
  items: Array<CommentViewModel>;
};

export type APIRequestsCountType = {
  id: string;
  ip: string;
  URL: string;
  date: string;
  createdAt: string;
};

export type AccountDataType = {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type EmailConfirmationType = {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
};

export type SortConditionsType = {
  pageNumber: string;
  pageSize: string;
  sortBy:
    | keyof BlogModel
    | keyof PostType
    | keyof ViewUserModel
    | keyof CommentViewModel;
  model:
    | typeof mockBlogModel
    | typeof mockPostModel
    | typeof mockUserModel
    | typeof mockCommentModel;
  sortDirection: SortOrder.asc | SortOrder.desc;
};
