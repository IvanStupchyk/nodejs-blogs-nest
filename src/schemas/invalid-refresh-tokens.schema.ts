import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

@Schema()
export class InvalidRefreshTokens {
  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  id: Types.ObjectId;

  @Prop({
    required: true,
  })
  refreshToken: string;

  @Prop({
    required: true,
  })
  createdAt: string;
}

export const InvalidRefreshTokensSchema =
  SchemaFactory.createForClass(InvalidRefreshTokens);
