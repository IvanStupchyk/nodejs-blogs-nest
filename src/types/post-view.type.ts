import { ExtendedLikesInfoViewType } from './posts-likes.types';

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
