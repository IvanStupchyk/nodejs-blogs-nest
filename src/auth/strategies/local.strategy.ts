import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { errorMessageGenerator } from '../../utils/error-message-generator';
import { ObjectId } from 'mongodb';
import { errorsConstants } from '../../constants/errors.contants';
import { CommandBus } from '@nestjs/cqrs';
import { ValidateUserCommand } from '../../domain/auth/use-cases/validate-user-use-case';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<{ id: ObjectId }> {
    if (typeof loginOrEmail !== 'string' && typeof password !== 'string') {
      errorMessageGenerator([
        { field: 'loginOrEmail', message: errorsConstants.login.loginOrEmail },
        { field: 'password', message: errorsConstants.login.password },
      ]);
    }

    if (typeof loginOrEmail !== 'string') {
      errorMessageGenerator([
        { field: 'loginOrEmail', message: errorsConstants.login.loginOrEmail },
      ]);
    }

    if (typeof password !== 'string') {
      errorMessageGenerator([
        { field: 'password', message: errorsConstants.login.password },
      ]);
    }

    const user = await this.commandBus.execute(
      new ValidateUserCommand(loginOrEmail, password),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
    };
  }
}
