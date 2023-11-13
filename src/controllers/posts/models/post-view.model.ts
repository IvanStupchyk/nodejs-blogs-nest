import { ObjectId } from 'mongodb';
import { ExtendedLikesInfoViewType } from '../../../types/posts-likes.types';

export class PostViewModel {
  id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: string;
  blogId: ObjectId;
  blogName: string;
  extendedLikesInfo: ExtendedLikesInfoViewType;
}
