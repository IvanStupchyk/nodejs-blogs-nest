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
import { UsersService } from '../../domains/users/users.service';
import { DeleteUserModel } from './models/delete-user.model';
import { Response } from 'express';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { RouterPaths } from '../../constants/router.paths';

@Controller()
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get(`${RouterPaths.users}`)
  async getUser(@Query() params: GetSortedUsersModel) {
    return await this.usersQueryRepository.getSortedUsers(params);
  }

  @UseGuards(BasicAuthGuard)
  @Post(`${RouterPaths.users}`)
  async createUser(@Body() body: NewUserDto) {
    return await this.usersService.createUser(body);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(`${RouterPaths.users}/:id`)
  async deleteUser(@Param() params: DeleteUserModel, @Res() res: Response) {
    const isUserExist = await this.usersService.deleteUser(params.id);

    !isUserExist
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
