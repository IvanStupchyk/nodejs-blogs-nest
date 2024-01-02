import { likeStatus } from './general.types';

export type CommentatorInfoType = {
  userId: string;
  userLogin: string;
};

export type CommentLikesViewType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: likeStatus;
};

export type CommentViewType = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
  likesInfo: CommentLikesViewType;
  createdAt: Date;
};

type PostInfoType = {
  id: string;
  title: string;
  blogId: string;
  blogName: string;
};

type CommentBloggerViewType = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
  likesInfo: CommentLikesViewType;
  postInfo: PostInfoType;
  createdAt: Date;
};

export type CommentsViewType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<CommentViewType>;
};

export type CommentsBloggerViewType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<CommentBloggerViewType>;
};
