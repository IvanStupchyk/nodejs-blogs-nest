import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserCommentLikes {
  @Prop({
    required: true,
  })
  commentId: string;

  @Prop({
    required: true,
  })
  myStatus: string;

  @Prop({
    required: true,
  })
  createdAt: string;
}

export const UserCommentLikesSchema =
  SchemaFactory.createForClass(UserCommentLikes);
