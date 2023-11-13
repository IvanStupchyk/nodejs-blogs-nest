import { ObjectId } from 'mongodb';

export class ViewUserModel {
  id: ObjectId;
  login: string;
  email: string;
  createdAt: string;
}
