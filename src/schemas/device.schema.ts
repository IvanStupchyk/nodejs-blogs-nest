import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

@Schema()
export class Device {
  @Prop({
    required: true,
  })
  id: string;

  @Prop({
    required: true,
  })
  ip: string;

  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  refreshToken: string;

  @Prop({
    required: true,
  })
  lastActiveDate: Date;

  @Prop({
    required: true,
  })
  expirationDate: Date;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  deviceId: Types.ObjectId;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
  })
  userId: Types.ObjectId;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

export type DeviceDocument = HydratedDocument<Device>;
