import {
  CommentatorInfoType,
  CommentLikesViewType,
} from '../../../types/general.types';
import { ObjectId } from 'mongodb';

export type CommentViewModel = {
  id: ObjectId;
  content: string;
  commentatorInfo: CommentatorInfoType;
  likesInfo: CommentLikesViewType;
  createdAt: string;
};
