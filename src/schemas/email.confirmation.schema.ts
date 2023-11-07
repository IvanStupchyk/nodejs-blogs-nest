import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class EmailConfirmation {
  @Prop({
    required: true,
  })
  confirmationCode: string;

  @Prop({
    required: true,
  })
  expirationDate: Date;

  @Prop({
    required: true,
  })
  isConfirmed: boolean;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);
