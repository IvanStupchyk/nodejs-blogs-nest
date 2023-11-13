import { ObjectId } from 'mongodb';
import { likeStatus } from '../../../types/general.types';

export class PostLikesType {
  constructor(
    public id: ObjectId,
    public userId: ObjectId,
    public myStatus: likeStatus,
    public postId: ObjectId,
    public addedAt: string,
  ) {}
}
