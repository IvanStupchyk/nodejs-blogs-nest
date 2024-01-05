import { likeStatus } from '../general.types';
import { PostImageViewType } from './post.image.types';

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
  createdAt: Date;
  blogId: string;
  blogName: string;
  images: PostImageViewType;
  extendedLikesInfo: ExtendedLikesInfoViewType;
}

export type PostType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
};

export type PostsType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostViewType>;
};
