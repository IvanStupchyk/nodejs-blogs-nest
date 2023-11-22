import { likeStatus } from './general.types';

export type PostLikeUserInfoType = {
  addedAt: string;
  userId: string;
  login: string;
};

export type ExtendedLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  newestLikes: Array<PostLikeUserInfoType>;
};

export type ExtendedLikesInfoViewType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: likeStatus;
  newestLikes: Array<PostLikeUserInfoType>;
};
