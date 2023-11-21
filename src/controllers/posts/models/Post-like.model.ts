export class PostLikeModel {
  constructor(
    public id: string,
    public userId: string,
    public login: string,
    public myStatus: string,
    public postId: string,
    public addedAt: string,
    public createdAt: string,
  ) {}
}
