import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RouterPaths } from '../../constants/router.paths';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { HTTP_STATUSES } from '../../utils/utils';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { UserInputDto } from '../../application/dto/users/user.input.dto';
import { ConfirmEmailInputDto } from '../../application/dto/auth/confirm-email.input.dto';
import { NewCodeToEmailInputDto } from '../../application/dto/auth/new-code-to-email.input.dto';
import { RefreshTokenMiddleware } from '../../middlewares/refresh-token.middleware';
import { RecoveryEmailInputDto } from '../../application/dto/auth/recovery-email.input.dto';
import { NewPasswordInputDto } from '../../application/dto/auth/new-password.input.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateUserPasswordCommand } from '../../domain/auth/use-cases/update-user-password-use-case';
import { RefreshTokenCommand } from '../../domain/auth/use-cases/refresh-token-use-case';
import { ConfirmEmailCommand } from '../../domain/auth/use-cases/confirm-email-use-case';
import { ResendEmailConfirmationCodeCommand } from '../../domain/auth/use-cases/resend-email-confirmation-code-use-case';
import { SendRecoveryPasswordCodeCommand } from '../../domain/auth/use-cases/send-recovery-password-code-use-case';
import { GetCurrentUserCommand } from '../../domain/auth/use-cases/get-current-user-use-case';
import { LogInUserCommand } from '../../domain/auth/use-cases/log-in-user-use-case';
import { LogOutUserCommand } from '../../domain/auth/use-cases/log-out-user-use-case';
import { CreateCommonUserCommand } from '../../domain/auth/use-cases/create-common-user-use-case';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller(RouterPaths.auth)
export class AuthController {
  constructor(
    private readonly refreshTokenMiddleware: RefreshTokenMiddleware,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(ThrottlerGuard, LocalAuthGuard)
  @Post('login')
  async login(
    @Ip() ip: string,
    @Headers() headers: any,
    @CurrentUserId() currentUserId,
    @Res() res: Response,
  ) {
    const userAgent = headers['user-agent'] || 'unknown';

    const result = await this.commandBus.execute(
      new LogInUserCommand(userAgent, currentUserId, ip),
    );

    if (result) {
      res
        .status(HTTP_STATUSES.OK_200)
        .cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: true,
        })
        .send({ accessToken: result.accessToken });
    } else {
      res.sendStatus(HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getOwnData(@CurrentUserId() currentUserId) {
    return await this.commandBus.execute(
      new GetCurrentUserCommand(currentUserId),
    );
  }

  @UseGuards(ThrottlerGuard)
  @Post('registration')
  @HttpCode(204)
  async registration(@Body() body: UserInputDto) {
    return await this.commandBus.execute(new CreateCommonUserCommand(body));
  }

  @UseGuards(ThrottlerGuard)
  @Post('registration-confirmation')
  @HttpCode(204)
  async registrationConfirmation(@Body() body: ConfirmEmailInputDto) {
    return await this.commandBus.execute(new ConfirmEmailCommand(body.code));
  }

  @UseGuards(ThrottlerGuard)
  @Post('registration-email-resending')
  @HttpCode(204)
  async resendEmail(@Body() body: NewCodeToEmailInputDto) {
    return await this.commandBus.execute(
      new ResendEmailConfirmationCodeCommand(body.email),
    );
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const isLogout = await this.commandBus.execute(new LogOutUserCommand(req));

    isLogout
      ? res.clearCookie('refreshToken').sendStatus(HttpStatus.NO_CONTENT)
      : res.sendStatus(HttpStatus.UNAUTHORIZED);
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const ids = await this.refreshTokenMiddleware.checkRefreshToken(req);
    if (!ids) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    const tokens = await this.commandBus.execute(
      new RefreshTokenCommand(
        ids.userId,
        ids.deviceId,
        req.cookies?.refreshToken,
      ),
    );

    if (!tokens) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    res
      .status(HttpStatus.OK)
      .cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
      })
      .send({ accessToken: tokens.accessToken });
  }

  @UseGuards(ThrottlerGuard)
  @Post('new-password')
  @HttpCode(204)
  async newPassword(@Body() body: NewPasswordInputDto) {
    return await this.commandBus.execute(new UpdateUserPasswordCommand(body));
  }

  @UseGuards(ThrottlerGuard)
  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body() body: RecoveryEmailInputDto) {
    return await this.commandBus.execute(
      new SendRecoveryPasswordCodeCommand(body.email),
    );
  }
}
