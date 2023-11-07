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
} from '@nestjs/common';
import { UsersQueryRepository } from '../../repositories/users.query.repository';
import { GetSortedUsersModel } from './models/Get.sorted.users.model';
import { CreateUserModel } from './models/Create.user.model';
import { UsersService } from '../../application/users.service';
import { DeleteUserModel } from './models/Delete.user.model';
import { Response } from 'express';

@Controller()
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersService: UsersService,
  ) {}

  @Get('users')
  async getUser(@Query() params: GetSortedUsersModel) {
    return await this.usersQueryRepository.getSortedUsers(params);
  }

  @Post('users')
  async createUser(@Body() body: CreateUserModel) {
    const { login, password, email } = body;
    return await this.usersService.createUser(login, password, email);
  }

  @Delete('users/:id')
  async deleteUser(@Param() params: DeleteUserModel, @Res() res: Response) {
    const isUserExist = await this.usersService.deleteUser(params.id);

    !isUserExist
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
