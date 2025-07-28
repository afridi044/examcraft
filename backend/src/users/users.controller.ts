import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import type { CreateUserInput, UpdateUserInput } from '../types/shared.types';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current user by auth ID' })
  async getCurrent(@Query('authId') authId: string) {
    const res = await this.usersService.getCurrentUser(authId);
    if (!res.success) throw new BadRequestException(res.error);
    return res;
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  async create(@Body() body: CreateUserInput) {
    const res = await this.usersService.create(body);
    if (!res.success) throw new BadRequestException(res.error);
    return res;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() body: UpdateUserInput) {
    const res = await this.usersService.update(id, body);
    if (!res.success) throw new BadRequestException(res.error);
    return res;
  }
}
