import { likeStatus } from './general.types';

type PostLikeUserInfoType = {
  addedAt: string;
  userId: string;
  login: string;
};

type ExtendedLikesInfoViewType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: likeStatus;
  newestLikes: Array<PostLikeUserInfoType>;
};

export class PostViewType {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: string;
  blogId: string;
  blogName: string;
  extendedLikesInfo: ExtendedLikesInfoViewType;
}

export type PostType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

export type PostsType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostViewType>;
};
