import { likeStatus } from './general.types';
import { ObjectId } from 'mongodb';
import { ViewUserModel } from '../controllers/users/models/view-user.model';

export type UserMethodsType = {
  canBeConfirmed: (code: string) => boolean;
  confirm: (code: string) => void;
  changeUserPassword: (passwordHash: string) => void;
  updateConfirmationCodeAndExpirationTime: (
    expirationDate: Date,
    code: string,
  ) => void;
  setNewUserCommentLike: (myStatus: likeStatus, commentId: ObjectId) => void;
  updateExistingUserCommentLike: (
    myStatus: likeStatus,
    commentId: ObjectId,
  ) => void;
};

export type ShowOwnUserDataType = {
  userId: string;
  login: string;
  email: string;
};

// export type UserModelType = mongoose.Model<UserType, {}, UserMethodsType>;
//
// type UserModelStaticType = mongoose.Model<UserType> & {
//   makeInstance(
//     login: string,
//     email: string,
//     passwordHash: string,
//     superUser: boolean,
//   ): HydratedDocument<UserType, UserMethodsType>;
// };
//
// export type UserModelFullType = UserModelType & UserModelStaticType;
//
// export type HydratedUserType = HydratedDocument<UserType, UserMethodsType>;

export type UsersType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<ViewUserModel>;
};
