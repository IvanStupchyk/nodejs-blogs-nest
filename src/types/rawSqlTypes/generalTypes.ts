export type InvalidRefreshTokenType = {
  id: string;
  userId: string;
  refreshToken: string;
  createdAt: string;
};

export class PostType {
  constructor(
    public id: string,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: string,
  ) {}
}
