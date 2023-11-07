import { ObjectId } from 'mongodb';
import {
  CommentatorInfoType,
  CommentLikesInfoType,
} from '../../../types/generalTypes';

export class CommentType {
  constructor(
    public id: ObjectId,
    public content: string,
    public postId: ObjectId,
    public commentatorInfo: CommentatorInfoType,
    public likesInfo: CommentLikesInfoType,
    public createdAt: string,
  ) {}
}
