import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  InternalServerErrorException,
  UseInterceptors
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';


@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('list')
  async getRoleList(@Query('user_role') userRole: string) {
    try {
      const data = await this.rolesService.getRoleList(userRole);

      if (data.length) {
        return {
          status: 1,
          message: 'Success',
          error: null,
          data,
        };
      }
      return {
        status: 0,
        message: 'Failed to get role list',
        error: 'Failed to get role list',
        data: [],
      };
    } catch (error) {
      throw new InternalServerErrorException({
        status: 0,
        message: 'There is an application error, please contact support team.',
        error: `Exception::${error.code ?? 500}`,
        data: null,
      });
    }
  }

    @Post('add')
    @UseInterceptors(AnyFilesInterceptor())  
    async addRole(@Body() dto: CreateRoleDto) {
      return this.rolesService.add(dto);
    }
}
