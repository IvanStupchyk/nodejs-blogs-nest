import { CommentatorInfoType, CommentLikesViewType } from './general.types';

export type CommentViewType = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
  likesInfo: CommentLikesViewType;
  createdAt: string;
};
