import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema()
export class CommentatorInfo {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  userId: Types.ObjectId;

  @Prop({
    required: true,
  })
  userLogin: string;
}

export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);
