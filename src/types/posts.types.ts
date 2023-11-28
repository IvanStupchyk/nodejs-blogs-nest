import { likeStatus } from './general.types';
import { Blog } from '../entities/blogs/Blog.entity';

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
  blogId: Blog;
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
  createdAt: Date;
};

export type PostsType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostViewType>;
};
