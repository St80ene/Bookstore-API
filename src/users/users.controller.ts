import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccessTokenGuard } from 'src/auth/common/guards/accessToken.guards';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() query) {
    return this.usersService.findAll(query);
  }

  @UseGuards(AccessTokenGuard)
  @Get('/user')
  findOne(@Req() req: Request) {
    return this.usersService.findById(req.user['sub']);
  }

  @UseGuards(AccessTokenGuard)
  @Patch('/user')
  update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user['sub'], updateUserDto);
  }

  @UseGuards(AccessTokenGuard)
  @Delete('/user')
  remove(@Req() req: Request) {
    return this.usersService.remove(req.user['sub']);
  }
}
