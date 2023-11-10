import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { CommentatorInfoSchema } from './commentator-info.schema';
import {
  CommentatorInfoType,
  CommentLikesInfoType,
} from '../types/general.types';
import { CommentLikesInfoSchema } from './comment-likes-info.schema';

@Schema()
export class Comment {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  id: Types.ObjectId;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  postId: Types.ObjectId;

  @Prop({
    required: true,
    type: CommentatorInfoSchema,
  })
  commentatorInfo: CommentatorInfoType;

  @Prop({
    required: true,
    type: CommentLikesInfoSchema,
  })
  likesInfo: CommentLikesInfoType;

  @Prop({
    required: true,
  })
  createdAt: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;
