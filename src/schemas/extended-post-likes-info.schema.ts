import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PostLikeUserInfoTypeSchema } from './post-like-user-info.schema';
import { PostLikeUserInfoType } from '../types/posts-likes.types';

@Schema()
export class ExtendedPostLikesInfo {
  @Prop({
    required: true,
  })
  likesCount: number;

  @Prop({
    required: true,
  })
  dislikesCount: number;

  @Prop({
    required: true,
    type: [PostLikeUserInfoTypeSchema],
  })
  newestLikes: Array<PostLikeUserInfoType>;
}

export const ExtendedPostLikesInfoSchema = SchemaFactory.createForClass(
  ExtendedPostLikesInfo,
);
