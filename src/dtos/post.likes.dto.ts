import { ObjectId } from 'mongodb';
import { likeStatus } from '../types/generalTypes';

export class PostLikesType {
  constructor(
    public id: ObjectId,
    public userId: ObjectId,
    public myStatus: likeStatus,
    public postId: ObjectId,
    public addedAt: string,
  ) {}
}
