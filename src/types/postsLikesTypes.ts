import { ObjectId } from 'mongodb';
import { likeStatus } from './generalTypes';

// export type PostLikesMethodsType = {
//   updateExistingPostLike: (myStatus: likeStatus) => void
// }
//
// export type postLikesModelType = mongoose.Model<PostLikesType, {}, PostLikesMethodsType>
//
// type PostLikesModelStaticType = mongoose.Model<PostLikesType> & {
//   makeInstance(
//     userId: ObjectId,
//     postId: ObjectId,
//     newStatus: likeStatus
//   ): HydratedDocument<PostLikesType, PostLikesMethodsType>
// }
//
// export type postLikesModelFullType = postLikesModelType & PostLikesModelStaticType
//
// export type HydratedPostLikesType = HydratedDocument<PostLikesType, PostLikesMethodsType>
//
export type PostsLikesInfoType = {
  id: ObjectId;
  userId: ObjectId;
  myStatus: likeStatus;
  postId: ObjectId;
  addedAt: string;
};

export type PostLikeUserInfoType = {
  addedAt: string;
  userId: ObjectId;
  login: string;
};

export type ExtendedLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  newestLikes: Array<PostLikeUserInfoType>;
};

export type ExtendedLikesInfoViewType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: likeStatus;
  newestLikes: Array<PostLikeUserInfoType>;
};
