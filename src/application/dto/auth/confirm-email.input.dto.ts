import { IsUUID } from 'class-validator';

export class ConfirmEmailInputDto {
  @IsUUID('4')
  code: string;
}
