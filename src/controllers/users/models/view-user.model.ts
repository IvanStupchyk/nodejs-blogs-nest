import { ObjectId } from 'mongodb';

export type ViewUserModel = {
  id: ObjectId;
  login: string;
  email: string;
  createdAt: string;
};
