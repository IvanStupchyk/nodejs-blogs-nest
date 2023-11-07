import {
  CommentatorInfoType,
  CommentLikesViewType,
} from '../../../types/generalTypes';
import { ObjectId } from 'mongodb';

export type CommentViewModel = {
  id: ObjectId;
  content: string;
  commentatorInfo: CommentatorInfoType;
  likesInfo: CommentLikesViewType;
  createdAt: string;
};
