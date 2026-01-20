import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  Query
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

@Post('check-user-access')
@UseInterceptors(AnyFilesInterceptor())  
async checkUserAccess(@Body() body: any) {
  return this.usersService.checkUserAccess(
    body.username,
    body.employee_id
  );
}

@Get('list')
async getUsers(@Query('user_role') userRole: string) {
  return this.usersService.list(userRole);
}

@Post('add')
@UseInterceptors(AnyFilesInterceptor())
async addUser(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}

@Post('status-change')
@UseInterceptors(AnyFilesInterceptor()) 
async updateUserStatus(@Body() body: any) {
  return this.usersService.updateUserStatus(
    body.username,
    Number(body.employee_id_fk),
    body.status, 
  );
}

@Post('reset-password')
@UseInterceptors(AnyFilesInterceptor()) 
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.usersService.resetPassword(dto);
}

@Post('delete')
@UseInterceptors(AnyFilesInterceptor())  
async deleteUser(@Body() body: any) {
  const { id } = body;
  return this.usersService.delete(id);
}

}
