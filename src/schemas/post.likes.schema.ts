import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { likeStatus } from '../types/generalTypes';

@Schema()
export class PostLikes {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  id: Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
  })
  myStatus: likeStatus;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  postId: Types.ObjectId;

  @Prop({
    required: true,
  })
  addedAt: string;

  updateExistingPostLike(myStatus: likeStatus) {
    this.myStatus = myStatus;
    this.addedAt = new Date().toISOString();
  }

  static createPostLike(
    userId: ObjectId,
    postId: ObjectId,
    newStatus: likeStatus,
    PostLikeModel: PostLikeModelType,
  ): PostLikesDocument {
    return new PostLikeModel({
      id: new ObjectId(),
      postId,
      addedAt: new Date().toISOString(),
      myStatus: newStatus,
      userId,
    });
  }
}

export const PostLikesSchema = SchemaFactory.createForClass(PostLikes);

PostLikesSchema.methods = {
  updateExistingPostLike: PostLikes.prototype.updateExistingPostLike,
};

const postLikesStaticMethods: PostLikesModelStaticType = {
  createPostLike: PostLikes.createPostLike,
};

PostLikesSchema.statics = postLikesStaticMethods;

export type PostLikesDocument = HydratedDocument<PostLikes>;

export type PostLikesModelStaticType = {
  createPostLike: (
    userId: ObjectId,
    postId: ObjectId,
    newStatus: likeStatus,
    PostLikeModel: PostLikeModelType,
  ) => PostLikesDocument;
};

export type PostLikeModelType = Model<PostLikesDocument> &
  PostLikesModelStaticType;
