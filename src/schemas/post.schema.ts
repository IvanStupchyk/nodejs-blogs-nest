import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Model, Types } from 'mongoose';
import { ObjectId } from 'mongodb';
import { ExtendedPostLikesInfoSchema } from './extended-post-likes-info.schema';
import {
  ExtendedLikesInfoType,
  PostLikeUserInfoType,
} from '../types/posts-likes.types';

@Schema()
export class Post {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  id: Types.ObjectId;

  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  shortDescription: string;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  blogId: Types.ObjectId;

  @Prop({
    required: true,
  })
  blogName: string;

  @Prop({
    required: true,
  })
  createdAt: string;

  @Prop({
    required: true,
    type: ExtendedPostLikesInfoSchema,
  })
  extendedLikesInfo: ExtendedLikesInfoType;

  setNewUserPostLike(newestLike: PostLikeUserInfoType) {
    this.extendedLikesInfo.newestLikes.push(newestLike);
  }

  updatePost(title: string, content: string, shortDescription: string) {
    this.content = content;
    this.title = title;
    this.shortDescription = shortDescription;
  }

  changeLikesCount(likesCount: number, dislikesCount: number) {
    this.extendedLikesInfo.likesCount = likesCount;
    this.extendedLikesInfo.dislikesCount = dislikesCount;
  }

  static createPost(
    title: string,
    shortDescription: string,
    content: string,
    blogId: ObjectId,
    blogName: string,
    PostModel: PostModelType,
  ): PostDocument {
    const extendedLikesInfo: ExtendedLikesInfoType = {
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    };

    return new PostModel({
      id: new ObjectId(),
      title,
      shortDescription,
      content,
      blogId,
      createdAt: new Date().toISOString(),
      blogName,
      extendedLikesInfo,
    });
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  setNewUserPostLike: Post.prototype.setNewUserPostLike,
  updatePost: Post.prototype.updatePost,
  changeLikesCount: Post.prototype.changeLikesCount,
};

const postStaticMethods: PostModelStaticType = {
  createPost: Post.createPost,
};

PostSchema.statics = postStaticMethods;

export type PostDocument = HydratedDocument<Post>;

export type PostModelStaticType = {
  createPost: (
    title: string,
    shortDescription: string,
    content: string,
    blogId: ObjectId,
    blogName: string,
    PostModel: PostModelType,
  ) => PostDocument;
};

export type PostModelType = Model<PostDocument> & PostModelStaticType;
