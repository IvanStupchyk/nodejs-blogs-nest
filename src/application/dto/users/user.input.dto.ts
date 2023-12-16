import { IsEmail, Length, Matches } from 'class-validator';
import { IsLoginExist } from '../../../utils/decorators/unique-login.decorator';
import { errorsConstants } from '../../../constants/errors.contants';
import { IsEmailExist } from '../../../utils/decorators/unique-email.decorator';

export class UserInputDto {
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @IsLoginExist({
    message: errorsConstants.user.uniqueLogin,
  })
  login: string;

  @Length(6, 20)
  password: string;

  @IsEmail()
  @IsEmailExist({
    message: errorsConstants.email.uniqueEmail,
  })
  email: string;
}
