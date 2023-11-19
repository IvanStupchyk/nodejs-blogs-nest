import { likeStatus } from '../../../types/general.types';

export class PostLikesType {
  constructor(
    public id: string,
    public userId: string,
    public myStatus: likeStatus,
    public postId: string,
    public addedAt: string,
  ) {}
}
