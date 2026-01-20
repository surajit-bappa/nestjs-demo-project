import {
  Controller,
  Get,
  Query,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
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
}
