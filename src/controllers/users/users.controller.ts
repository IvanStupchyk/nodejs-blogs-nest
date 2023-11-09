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
import { UsersQueryRepository } from '../../infrastructure/repositories/users.query.repository';
import { GetSortedUsersModel } from './models/Get.sorted.users.model';
import { NewUserDto } from './models/new-user.dto';
import { UsersService } from '../../application/users.service';
import { DeleteUserModel } from './models/Delete.user.model';
import { Response } from 'express';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';

@Controller()
export class UsersController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get('users')
  async getUser(@Query() params: GetSortedUsersModel) {
    return await this.usersQueryRepository.getSortedUsers(params);
  }

  @UseGuards(BasicAuthGuard)
  @Post('users')
  async createUser(@Body() body: NewUserDto) {
    return await this.usersService.createUser(body);
  }

  @UseGuards(BasicAuthGuard)
  @Delete('users/:id')
  async deleteUser(@Param() params: DeleteUserModel, @Res() res: Response) {
    const isUserExist = await this.usersService.deleteUser(params.id);

    !isUserExist
      ? res.sendStatus(HttpStatus.NOT_FOUND)
      : res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
