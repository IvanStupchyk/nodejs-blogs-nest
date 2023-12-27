import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersQueryDto } from '../../application/dto/users/users.query.dto';
import { DeleteUserParamsDto } from '../../application/dto/users/delete-user.params.dto';
import { Response } from 'express';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSuperUserCommand } from '../../domain/users/use-cases/create-super-user-use-case';
import { DeleteUserCommand } from '../../domain/users/use-cases/delete-user-use-case';
import { UsersQueryRepository } from '../../infrastructure/repositories/users/users-query.repository';
import { SAUserInputDto } from '../../application/dto/users/sa-user.input.dto';
import { UserBanDto } from '../../application/dto/users/user-ban.input.dto';
import { BanUserParamsDto } from '../../application/dto/users/ban-user.params.dto';
import { BanUserCommand } from '../../domain/users/use-cases/ban-user-use-case';

@Controller(RouterPaths.users)
export class UsersSaController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getUser(@Query() params: UsersQueryDto) {
    return await this.usersQueryRepository.getSortedUsers(params);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() body: SAUserInputDto) {
    return await this.commandBus.execute(new CreateSuperUserCommand(body));
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id/ban')
  @HttpCode(204)
  async banUser(@Param() params: BanUserParamsDto, @Body() body: UserBanDto) {
    return await this.commandBus.execute(new BanUserCommand(params.id, body));
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deleteUser(@Param() params: DeleteUserParamsDto, @Res() res: Response) {
    const isUserDeleted = await this.commandBus.execute(
      new DeleteUserCommand(params.id),
    );

    !isUserDeleted
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
