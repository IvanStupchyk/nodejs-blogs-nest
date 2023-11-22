export class BlogModel {
  constructor(
    public id: string,
    public name: string,
    public userId: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}
}
