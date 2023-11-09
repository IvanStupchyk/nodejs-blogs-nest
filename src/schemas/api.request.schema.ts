import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class ApiRequest {
  @Prop({
    required: true,
  })
  ip: string;

  @Prop({
    required: true,
  })
  URL: string;

  @Prop({
    required: true,
  })
  date: Date;
}

export const ApiRequestSchema = SchemaFactory.createForClass(ApiRequest);

export type ApiRequestDocument = HydratedDocument<ApiRequest>;
