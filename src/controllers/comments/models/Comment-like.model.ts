export class CommentLikeModel {
  constructor(
    public id: string,
    public userId: string,
    public commentId: string,
    public myStatus: string,
    public createdAt: string,
  ) {}
}
