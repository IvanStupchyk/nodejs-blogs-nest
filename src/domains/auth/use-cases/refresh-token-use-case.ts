import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../infrastructure/jwt.service';
import { ObjectId } from 'mongodb';
import { DevicesRepository } from '../../../infrastructure/repositories/devices.repository';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../../schemas/user.schema';
import { UsersRepository } from '../../../infrastructure/repositories/users.repository';

export class RefreshTokenCommand {
  constructor(
    public userId: ObjectId,
    public deviceId: ObjectId,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private readonly devicesRepository: DevicesRepository,
    private readonly jwtService: JwtService,
    private readonly usersRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId, deviceId } = command;

    const accessToken = await this.jwtService.createAccessJWT(userId);
    const refreshToken = await this.jwtService.createRefreshJWT(
      userId,
      deviceId,
    );

    try {
      const result: any =
        await this.jwtService.verifyRefreshToken(refreshToken);
      const lastActiveDate = new Date(result.iat * 1000);
      const expirationDate = new Date(result.exp * 1000);

      await this.devicesRepository.updateExistingSession(
        deviceId,
        lastActiveDate,
        expirationDate,
        refreshToken,
      );
    } catch (error) {
      console.log(error);
    }

    return { accessToken, refreshToken };
  }
}
