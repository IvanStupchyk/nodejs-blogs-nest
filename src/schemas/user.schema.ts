import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';
import { AccountDataSchema } from './account.data.schema';
import {
  AccountDataType,
  EmailConfirmationType,
  likeStatus,
  UserCommentLikesType,
} from '../types/generalTypes';
import { EmailConfirmationSchema } from './email.confirmation.schema';
import { UserCommentLikesSchema } from './user.comment.likes.schema';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';

@Schema()
export class User {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  id: Types.ObjectId;

  @Prop({
    required: true,
    type: AccountDataSchema,
  })
  accountData: AccountDataType;

  @Prop({
    required: true,
    type: EmailConfirmationSchema,
  })
  emailConfirmation: EmailConfirmationType;

  @Prop({
    required: true,
    type: [UserCommentLikesSchema],
  })
  commentsLikes: Array<UserCommentLikesType>;

  changeUserPassword(passwordHash: string) {
    return (this.accountData.passwordHash = passwordHash);
  }

  canBeConfirmed(code: string) {
    return (
      this.emailConfirmation.confirmationCode === code &&
      this.emailConfirmation.expirationDate > new Date()
    );
  }

  confirm(code: string) {
    if (!this.canBeConfirmed(code)) throw new Error('code is expired');
    if (this.emailConfirmation.isConfirmed)
      throw new Error('email is already confirmed');

    return (this.emailConfirmation.isConfirmed = true);
  }

  updateConfirmationCodeAndExpirationTime(date: Date, code: string) {
    this.emailConfirmation.expirationDate = date;
    this.emailConfirmation.confirmationCode = code;
  }

  setNewUserCommentLike(myStatus: likeStatus, commentId: ObjectId) {
    this.commentsLikes.push({
      commentId,
      myStatus,
      createdAt: new Date().toISOString(),
    });
  }

  updateExistingUserCommentLike(myStatus: likeStatus, commentId: ObjectId) {
    const initialComment = this.commentsLikes.find((c) =>
      new ObjectId(c.commentId).equals(commentId),
    );

    if (initialComment) initialComment.myStatus = myStatus;
  }

  static createUser(
    login: string,
    email: string,
    passwordHash: string,
    superUser: boolean,
    UserModel: UserModelType,
  ): UserDocument {
    return new UserModel({
      id: new ObjectId(),
      accountData: {
        login,
        email,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: uuidv4(),
        expirationDate: superUser
          ? new Date()
          : add(new Date(), {
              hours: 1,
              minutes: 30,
            }),
        isConfirmed: superUser,
      },
      commentsLikes: [],
    });
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  changeUserPassword: User.prototype.changeUserPassword,
  canBeConfirmed: User.prototype.canBeConfirmed,
  confirm: User.prototype.confirm,
  updateConfirmationCodeAndExpirationTime:
    User.prototype.updateConfirmationCodeAndExpirationTime,
  setNewUserCommentLike: User.prototype.setNewUserCommentLike,
  updateExistingUserCommentLike: User.prototype.updateExistingUserCommentLike,
};

const userStaticMethods: UserModelStaticType = {
  createUser: User.createUser,
};

UserSchema.statics = userStaticMethods;

export type UserDocument = HydratedDocument<User>;

export type UserModelStaticType = {
  createUser: (
    login: string,
    email: string,
    passwordHash: string,
    superUser: boolean,
    UserModel: UserModelType,
  ) => UserDocument;
};

export type UserModelType = Model<UserDocument> & UserModelStaticType;
