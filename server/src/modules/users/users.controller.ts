import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser, Roles } from '../../common/decorators/auth.decorators';
import { type PageResponseDto, PageQueryDto } from '../../common/dto/pagination.dto';
import { type AuthUser } from '../../common/types/auth-user';
import { type UserResponseDto } from '../auth/dto/auth.dto';
import { CreateUserRequestDto, UpdateUserRequestDto } from './dto/user.dto';
import { toUserResponse } from './user.mapper';
import { UsersService } from './users.service';

@Controller('users')
@Roles('ADMIN')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async list(@Query() query: PageQueryDto): Promise<PageResponseDto<UserResponseDto>> {
    const page = await this.users.list(query);
    return { ...page, items: page.items.map(toUserResponse) };
  }

  @Post()
  async create(@CurrentUser() actor: AuthUser, @Body() body: CreateUserRequestDto): Promise<UserResponseDto> {
    return toUserResponse(await this.users.create(actor, body));
  }

  @Patch(':id')
  async update(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserRequestDto
  ): Promise<UserResponseDto> {
    return toUserResponse(await this.users.update(actor, id, body));
  }
}
