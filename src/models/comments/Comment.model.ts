export class CommentModel {
  constructor(
    public id: string,
    public content: string,
    public postId: string,
    public userId: string,
    public userLogin: string,
    public createdAt: string,
  ) {}
}
