import { ObjectId } from 'mongodb';
import { ExtendedLikesInfoType } from '../../../types/posts-likes.types';

export class PostType {
  constructor(
    public id: ObjectId,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: ObjectId,
    public createdAt: string,
    public blogName: string,
    public extendedLikesInfo: ExtendedLikesInfoType,
  ) {}
}
