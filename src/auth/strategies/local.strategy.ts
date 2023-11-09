import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../application/auth.service';
import { errorMessageGenerator } from '../../utils/errorMessageGenerator';
import { ObjectId } from 'mongodb';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
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
        { field: 'loginOrEmail', message: 'loginOrEmail should be string' },
        { field: 'password', message: 'password should be string' },
      ]);
    }

    if (typeof loginOrEmail !== 'string') {
      errorMessageGenerator([
        { field: 'loginOrEmail', message: 'loginOrEmail should be string' },
      ]);
    }
    //
    if (typeof password !== 'string') {
      errorMessageGenerator([
        { field: 'password', message: 'password should be string' },
      ]);
    }

    const user = await this.authService.validateUser(loginOrEmail, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
    };
  }
}
