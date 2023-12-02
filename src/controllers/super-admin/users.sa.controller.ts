import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersQueryDto } from '../../dto/users/users.query.dto';
import { DeleteUserParamsDto } from '../../dto/users/delete-user.params.dto';
import { Response } from 'express';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSuperUserCommand } from '../../domain/users/use-cases/create-super-user-use-case';
import { DeleteUserCommand } from '../../domain/users/use-cases/delete-user-use-case';
import { UsersQueryRepository } from '../../infrastructure/repositories/users/users-query.repository';
import { SAUserInputDto } from '../../dto/users/sa-user.input.dto';

@Controller()
export class UsersSaController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get(`${RouterPaths.users}`)
  async getUser(@Query() params: UsersQueryDto) {
    return await this.usersQueryRepository.getSortedUsers(params);
  }

  @UseGuards(BasicAuthGuard)
  @Post(`${RouterPaths.users}`)
  async createUser(@Body() body: SAUserInputDto) {
    return await this.commandBus.execute(new CreateSuperUserCommand(body));
  }

  @UseGuards(BasicAuthGuard)
  @Delete(`${RouterPaths.users}/:id`)
  async deleteUser(@Param() params: DeleteUserParamsDto, @Res() res: Response) {
    const isUserDeleted = await this.commandBus.execute(
      new DeleteUserCommand(params.id),
    );

    !isUserDeleted
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
