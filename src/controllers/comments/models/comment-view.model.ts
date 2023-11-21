import {
  CommentatorInfoType,
  CommentLikesViewType,
} from '../../../types/general.types';

export class CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoType;
  likesInfo: CommentLikesViewType;
  createdAt: string;
}
