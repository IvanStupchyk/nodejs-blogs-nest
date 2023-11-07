import { ObjectId } from 'mongodb';

export class BlogType {
  constructor(
    public id: ObjectId,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}
}
