import { ExtendedLikesInfoViewType } from '../../../types/posts-likes.types';

export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: string;
  blogId: string;
  blogName: string;
  extendedLikesInfo: ExtendedLikesInfoViewType;
}
