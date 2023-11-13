import {
  CommentatorInfoType,
  CommentLikesViewType,
} from '../../../types/general.types';
import { ObjectId } from 'mongodb';

export class CommentViewModel {
  id: ObjectId;
  content: string;
  commentatorInfo: CommentatorInfoType;
  likesInfo: CommentLikesViewType;
  createdAt: string;
}
