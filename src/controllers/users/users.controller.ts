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
import { UsersQueryRepository } from '../../infrastructure/repositories/users-query.repository';
import { GetSortedUsersModel } from './models/get-sorted-users.model';
import { NewUserDto } from '../../dtos/users/new-user.dto';
import { DeleteUserModel } from './models/delete-user.model';
import { Response } from 'express';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { RouterPaths } from '../../constants/router.paths';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSuperUserCommand } from '../../domains/users/use-cases/create-super-user-use-case';
import { DeleteUserCommand } from '../../domains/users/use-cases/delete-user-use-case';

@Controller()
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get(`${RouterPaths.users}`)
  async getUser(@Query() params: GetSortedUsersModel) {
    return await this.usersQueryRepository.getSortedUsers(params);
  }

  @UseGuards(BasicAuthGuard)
  @Post(`${RouterPaths.users}`)
  async createUser(@Body() body: NewUserDto) {
    return await this.commandBus.execute(new CreateSuperUserCommand(body));
  }

  @UseGuards(BasicAuthGuard)
  @Delete(`${RouterPaths.users}/:id`)
  async deleteUser(@Param() params: DeleteUserModel, @Res() res: Response) {
    const isUserDeleted = await this.commandBus.execute(
      new DeleteUserCommand(params.id),
    );

    !isUserDeleted
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
