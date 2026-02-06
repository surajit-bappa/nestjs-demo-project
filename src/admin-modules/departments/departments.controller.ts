import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly deptservice: DepartmentsService) {}


@Get('list')
async getDepartments() {
  const departments = await this.deptservice.list();

  if (departments.length > 0) {
      return {
        status: 1,
        message: 'Department list retrieved successfully',
        error: null,
        data: departments,
      };
    }

    return {
      status: 0,
      message: 'No department list found',
      error: 'No data found',
      data: null,
    };
  }

  @Post('add')
  @UseInterceptors(AnyFilesInterceptor())  
  async addDepartment(@Body() dto: CreateDepartmentDto) {
    return this.deptservice.add(dto);
  }

  @Post('update')
    @UseInterceptors(AnyFilesInterceptor())  
  async updateDepartment(@Body() dto: UpdateDepartmentDto) {
    return this.deptservice.update(dto);
  }

  @Post('delete')
  @UseInterceptors(AnyFilesInterceptor())  
  async deleteDepartment(@Body() body: any) {
    const { id } = body;
    return this.deptservice.delete(id);
  }

}
