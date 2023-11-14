import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RouterPaths } from '../../constants/router.paths';
import { LoginUserDto } from '../../domains/auth/models/login-user.dto';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { HTTP_STATUSES } from '../../utils/utils';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UsersQueryRepository } from '../../infrastructure/repositories/users-query.repository';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { ApiRequestService } from '../../application/api-request.service';
import { NewUserDto } from '../../dtos/users/new-user.dto';
import { ConfirmEmailModel } from '../../domains/auth/models/confirm-email.model';
import { ResendingCodeToEmailDto } from '../../domains/auth/models/resending-code-to-email.dto';
import { RefreshTokenMiddleware } from '../../infrastructure/refresh-token.middleware';
import { RecoveryCodeEmailDto } from '../../domains/auth/models/recovery-code-email.dto';
import { NewPasswordDto } from '../../domains/auth/models/new-password.dto';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateUserPasswordCommand } from '../../domains/auth/use-cases/update-user-password-use-case';
import { RefreshTokenCommand } from '../../domains/auth/use-cases/refresh-token-use-case';
import { ConfirmEmailCommand } from '../../domains/auth/use-cases/confirm-email-use-case';
import { ResendEmailConfirmationCodeCommand } from '../../domains/auth/use-cases/resend-email-confirmation-code-use-case';
import { SendRecoveryPasswordCodeCommand } from '../../domains/auth/use-cases/send-recovery-password-code-use-case';
import { GetCurrentUserCommand } from '../../domains/auth/use-cases/get-current-user-use-case';
import { LogInUserCommand } from '../../domains/auth/use-cases/log-in-user-use-case';
import { LogOutUserCommand } from '../../domains/auth/use-cases/log-out-user-use-case';
import { CreateCommonUserCommand } from '../../domains/auth/use-cases/create-common-user-use-case';
import { UsersRepository } from '../../infrastructure/repositories/users.repository';

@Controller()
export class AuthController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly apiRequestCounter: ApiRequestService,
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokenMiddleware: RefreshTokenMiddleware,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post(`${RouterPaths.auth}/login`)
  async login(
    @Body() body: LoginUserDto,
    @Req() req: Request,
    @CurrentUserId() currentUserId,
    @Res() res: Response,
  ) {
    await this.apiRequestCounter.countRequest(req);

    const result = await this.commandBus.execute(
      new LogInUserCommand(req, currentUserId),
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
  @Get(`${RouterPaths.auth}/me`)
  async getOwnData(@CurrentUserId() currentUserId) {
    return await this.commandBus.execute(
      new GetCurrentUserCommand(currentUserId),
    );
  }

  @Post(`${RouterPaths.auth}/registration`)
  @HttpCode(204)
  async registration(@Body() body: NewUserDto, @Req() req: Request) {
    await this.apiRequestCounter.countRequest(req);

    return await this.commandBus.execute(new CreateCommonUserCommand(body));
  }

  @Post(`${RouterPaths.auth}/registration-confirmation`)
  @HttpCode(204)
  async registrationConfirmation(
    @Body() body: ConfirmEmailModel,
    @Req() req: Request,
  ) {
    await this.apiRequestCounter.countRequest(req);

    return await this.commandBus.execute(new ConfirmEmailCommand(body.code));
  }

  @Post(`${RouterPaths.auth}/registration-email-resending`)
  @HttpCode(204)
  async resendEmail(
    @Body() body: ResendingCodeToEmailDto,
    @Req() req: Request,
  ) {
    await this.apiRequestCounter.countRequest(req);

    return await this.commandBus.execute(
      new ResendEmailConfirmationCodeCommand(body.email),
    );
  }

  @Post(`${RouterPaths.auth}/logout`)
  async logout(@Req() req: Request, @Res() res: Response) {
    const isLogout = await this.commandBus.execute(new LogOutUserCommand(req));

    isLogout
      ? res.clearCookie('refreshToken').sendStatus(HttpStatus.NO_CONTENT)
      : res.sendStatus(HttpStatus.UNAUTHORIZED);
  }

  @Post(`${RouterPaths.auth}/refresh-token`)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const ids = await this.refreshTokenMiddleware.checkRefreshToken(req);
    if (!ids) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    const user = await this.usersRepository.fetchAllUserDataById(ids.userId);

    if (user.isRefreshTokenInvalid(req.cookies?.refreshToken)) {
      return res.sendStatus(HttpStatus.UNAUTHORIZED);
    }

    const { accessToken, refreshToken } = await this.commandBus.execute(
      new RefreshTokenCommand(
        ids.userId,
        ids.deviceId,
        req.cookies?.refreshToken,
      ),
    );

    res
      .status(HttpStatus.OK)
      .cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })
      .send({ accessToken });
  }

  @Post(`${RouterPaths.auth}/new-password`)
  @HttpCode(204)
  async newPassword(@Body() body: NewPasswordDto, @Req() req: Request) {
    await this.apiRequestCounter.countRequest(req);

    return await this.commandBus.execute(new UpdateUserPasswordCommand(body));
  }

  @Post(`${RouterPaths.auth}/password-recovery`)
  @HttpCode(204)
  async passwordRecovery(
    @Body() body: RecoveryCodeEmailDto,
    @Req() req: Request,
  ) {
    await this.apiRequestCounter.countRequest(req);

    return await this.commandBus.execute(
      new SendRecoveryPasswordCodeCommand(body.email),
    );
  }
}
