import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class CommentLikesInfo {
  @Prop({
    required: true,
  })
  likesCount: number;

  @Prop({
    required: true,
  })
  dislikesCount: number;
}

export const CommentLikesInfoSchema =
  SchemaFactory.createForClass(CommentLikesInfo);
