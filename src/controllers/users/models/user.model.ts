import { ObjectId } from 'mongodb';
import {
  AccountDataType,
  EmailConfirmationType,
  UserCommentLikesType,
} from '../../../types/general.types';

export class UserType {
  constructor(
    public id: ObjectId,
    public accountData: AccountDataType,
    public emailConfirmation: EmailConfirmationType,
    public commentsLikes: Array<UserCommentLikesType>,
  ) {}
}
