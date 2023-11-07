import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class AccountData {
  @Prop({
    required: true,
  })
  login: string;

  @Prop({
    required: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  passwordHash: string;

  @Prop({
    required: true,
  })
  createdAt: string;
}

export const AccountDataSchema = SchemaFactory.createForClass(AccountData);
