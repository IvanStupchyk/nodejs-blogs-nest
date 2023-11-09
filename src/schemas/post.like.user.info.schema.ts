import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema()
export class PostLikeUserInfo {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
  })
  login: string;

  @Prop({
    required: true,
  })
  addedAt: string;
}

export const PostLikeUserInfoTypeSchema =
  SchemaFactory.createForClass(PostLikeUserInfo);
