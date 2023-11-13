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
import { AuthService } from '../../application/auth.service';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { HTTP_STATUSES } from '../../utils/utils';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UsersQueryRepository } from '../../infrastructure/repositories/users-query.repository';
import { CurrentUserId } from '../../auth/current-user-param.decorator';
import { ApiRequestService } from '../../application/api-request.service';
import { NewUserDto } from '../../dtos/users/new-user.dto';
import { ConfirmEmailModel } from '../../domains/auth/models/confirm-email.model';
import { ResendingCodeToEmailDto } from '../../domains/auth/models/resending-code-to-email.dto';
import { RefreshTokenMiddleware } from '../../infrastructure/refresh-token.service';
import { RecoveryCodeEmailDto } from '../../domains/auth/models/recovery-code-email.dto';
import { NewPasswordDto } from '../../domains/auth/models/new-password.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly apiRequestCounter: ApiRequestService,
    private readonly refreshTokenMiddleware: RefreshTokenMiddleware,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post(`${RouterPaths.auth}/login`)
  async login(
    @Body() body: LoginUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.apiRequestCounter.countRequest(req);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = await this.authService.loginUser(req, req.user.id);

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
    return await this.authService.getOwnData(currentUserId);
  }

  @Post(`${RouterPaths.auth}/registration`)
  @HttpCode(204)
  async registration(@Body() body: NewUserDto, @Req() req: Request) {
    await this.apiRequestCounter.countRequest(req);

    return await this.authService.createUser(body);
  }

  @Post(`${RouterPaths.auth}/registration-confirmation`)
  @HttpCode(204)
  async registrationConfirmation(
    @Body() body: ConfirmEmailModel,
    @Req() req: Request,
  ) {
    await this.apiRequestCounter.countRequest(req);

    return await this.authService.confirmEmail(body.code);
  }

  @Post(`${RouterPaths.auth}/registration-email-resending`)
  @HttpCode(204)
  async resendEmail(
    @Body() body: ResendingCodeToEmailDto,
    @Req() req: Request,
  ) {
    await this.apiRequestCounter.countRequest(req);

    return await this.authService.resendEmail(body.email);
  }

  @Post(`${RouterPaths.auth}/logout`)
  async logout(@Req() req: Request, @Res() res: Response) {
    const isLogout = await this.authService.logoutUser(req);

    isLogout
      ? res.clearCookie('refreshToken').sendStatus(HttpStatus.NO_CONTENT)
      : res.sendStatus(HttpStatus.UNAUTHORIZED);
  }

  @Post(`${RouterPaths.auth}/refresh-token`)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const ids = await this.refreshTokenMiddleware.checkRefreshToken(req);
    if (!ids) return res.sendStatus(HttpStatus.UNAUTHORIZED);

    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      ids.userId,
      ids.deviceId,
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

    return await this.authService.updatePassword(
      body.newPassword,
      body.recoveryCode,
    );
  }

  @Post(`${RouterPaths.auth}/password-recovery`)
  @HttpCode(204)
  async passwordRecovery(
    @Body() body: RecoveryCodeEmailDto,
    @Req() req: Request,
  ) {
    await this.apiRequestCounter.countRequest(req);

    return await this.authService.sendRecoveryPasswordCode(body.email);
  }
}
