import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('list')
  async getUsers() {
    return this.usersService.listUsers();
  }

  @Post('add')
  @UseInterceptors(AnyFilesInterceptor()) // allows form-data
  async addUser(@Body() body: any) {
    console.log('👉 Received body:', body);

    const { password, username, role, employee_id_fk, logedInEmpNo } = body;

    // === Validation (like CodeIgniter) ===
    if (!logedInEmpNo) {
      return {
        status: 0,
        message: 'Failed to add user.',
        error: 'Request parameter logedInEmpNo is mandatory.',
        data: null,
      };
    }

    if (!password || !username || !role || !employee_id_fk) {
      return {
        status: 0,
        message: 'Failed to add user.',
        error: 'Missing required parameters.',
        data: null,
      };
    }

    // === Call service to insert user ===
    const result = await this.usersService.create({
      employee_id_fk,
      username,
      password,
      role,
      logedInEmpNo,
    });

    if (result.success) {
      return {
        status: 1,
        message: 'User added successfully',
        error: null,
        data: result.data,
      };
    } else {
      return {
        status: 0,
        message: 'Failed to add user.',
        error: result.error,
        data: null,
      };
    }
  }

  @Post('update')
  @UseInterceptors(AnyFilesInterceptor())
  async updateUser(@Body() body: any) {
    console.log('✏️ Update user request:', body);

    const { id, username, role, employee_id_fk, logedInEmpNo, isactive } = body;

    if (!id) {
      return { status: 0, message: 'Failed to update user.', error: 'Request parameter id is mandatory.', data: null };
    }

    if (!logedInEmpNo) {
      return { status: 0, message: 'Failed to update user.', error: 'Request parameter logedInEmpNo is mandatory.', data: null };
    }

    const result = await this.usersService.update({
      id,
      username,
      role,
      employee_id_fk,
      isactive,
      logedInEmpNo,
    });

    if (result.success) {
      return { status: 1, message: 'User updated successfully.', error: null, data: result.data };
    } else {
      return { status: 0, message: 'Failed to update user.', error: result.error, data: null };
    }
  }


@Post('delete')
  @UseInterceptors(AnyFilesInterceptor())
  async deleteUser(@Body() body: any) {
    console.log('🗑️ Delete user request:', body);

    const { id } = body;

    if (!id) {
      return {
        status: 0,
        message: 'Failed to delete user.',
        error: 'Request parameter id is mandatory.',
        data: null,
      };
    }

    const result = await this.usersService.delete(id);

    if (result.success) {
      return {
        status: 1,
        message: 'User deleted successfully.',
        error: null,
        data: null,
      };
    } else {
      return {
        status: 0,
        message: 'Failed to delete user.',
        error: result.error,
        data: null,
      };
    }
  }

}
