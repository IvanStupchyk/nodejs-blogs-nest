import { ObjectId } from 'mongodb';
import {
  AccountDataType,
  EmailConfirmationType,
  UserCommentLikesType,
} from '../types/generalTypes';

export class UserType {
  constructor(
    public id: ObjectId,
    public accountData: AccountDataType,
    public emailConfirmation: EmailConfirmationType,
    public commentsLikes: Array<UserCommentLikesType>,
  ) {}
}
